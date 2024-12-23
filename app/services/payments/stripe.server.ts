import Stripe from "stripe";
import { captureObservabilityException } from "~/lib/observability";
import {
  stripeProducts,
  subscriptionTiers,
} from "~/services/payments/subscription";
import type {
  CustomerSubscription,
  SubscriptionTier,
} from "~/services/payments/types";
import { numberFormat } from "~/services/payments/utils";

export type ProductWithPrices = Stripe.Product & {
  prices: Stripe.Price[];
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
});

const listProductsWithPrices = async (): Promise<ProductWithPrices[]> => {
  const products = await stripe.products.list({
    ids: stripeProducts,
  });
  const prices = await stripe.prices.list({ limit: 100 });
  return products.data.map((product) => {
    const productPrices = prices.data.filter(
      (price) => price.product === product.id,
    );
    return {
      ...product,
      prices: productPrices,
    };
  });
};

export const retrieveSubscription = async (
  subscriptionId: string,
): Promise<Stripe.Subscription> => {
  return await stripe.subscriptions.retrieve(subscriptionId);
};

const getPrice = async (priceId: string): Promise<Stripe.Price> => {
  return await stripe.prices.retrieve(priceId);
};

const getProduct = async (productId: string): Promise<Stripe.Product> => {
  return await stripe.products.retrieve(productId);
};

export const updateSubscription = async (
  subscriptionId: string,
  updateParams: Stripe.SubscriptionUpdateParams,
): Promise<Stripe.Subscription> => {
  return await stripe.subscriptions.update(subscriptionId, {
    ...updateParams,
  });
};

export const generateBillingPortalLink = async (
  customerId: string,
  returnRoute = "/dashboard",
): Promise<string> => {
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.APP_URL}${returnRoute}`,
  });
  return portalSession.url;
};
export const generatePaymentLink = async (
  priceId: string,
  email: string,
  organizationId: number,
  customer?: string,
): Promise<string> => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.APP_URL}/dashboard?payment=success`,
    cancel_url: `${process.env.APP_URL}/dashboard?payment=cancel`,
    customer_email: customer ? undefined : email,
    customer: customer,
    metadata: {
      organizationId,
    },
  });
  if (!session.url) {
    throw new Error("Failed to create payment session");
  }
  return session.url;
};

const serializeSubscriptionTiers = (
  products: ProductWithPrices[],
): SubscriptionTier[] => {
  const serializedProducts: SubscriptionTier[] = [];
  for (const product of products) {
    const prices = product.prices;
    const subscriptionConfig = subscriptionTiers[product.id];
    for (const price of prices) {
      if (!price.unit_amount) {
        captureObservabilityException(new Error("Misconfigured price"));
        continue;
      }
      serializedProducts.push({
        id: product.id,
        name: product.name,
        priceId: price.id,
        priceString: numberFormat.format(price.unit_amount / 100),
        priceNumber: price.unit_amount / 100,
        description: "",
        schedule: price.recurring?.interval === "year" ? "yearly" : "monthly",
        features: subscriptionConfig.features,
        isRecommended: subscriptionConfig.isRecommended,
      });
    }
  }
  return serializedProducts;
};
export const listSubscriptionTiers = async (): Promise<SubscriptionTier[]> => {
  const productsWithPrices = await listProductsWithPrices();
  return serializeSubscriptionTiers(productsWithPrices);
};

export const getCustomerSubscription = async (
  externalId: string,
): Promise<CustomerSubscription> => {
  const externalSubscription = await retrieveSubscription(externalId);
  const price = await getPrice(externalSubscription.items.data[0].price.id);
  const product = await getProduct(price.product.toString());

  if (!price.unit_amount) {
    throw new Error("Misconfigured price");
  }
  return {
    product: {
      name: product.name,
      schedule: price.recurring?.interval === "year" ? "yearly" : "monthly",
      priceString: numberFormat.format(price.unit_amount / 100),
    },
    nextPaymentDate: externalSubscription.current_period_end * 1000,
  };
};
