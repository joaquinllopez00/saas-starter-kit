import type { ActionFunctionArgs } from "@remix-run/node";
import type Stripe from "stripe";
import stripe from "stripe";
import { z } from "zod";
import {
  findSubscriptionByExternalId,
  insertSubscription,
  updateSubscription,
  updateSubscriptionDeleted,
} from "~/services/db/subscriptions.server";
import { SubscriptionNotFoundError } from "~/services/payments/errors";
import {
  retrieveSubscription as retrieveStripeSubscription,
  updateSubscription as updateStripeSubscription,
} from "~/services/payments/stripe.server";

const CheckoutSessionCompletedSchema = z.object({
  subscription: z.string(),
  metadata: z.object({
    organizationId: z.string(),
  }),
});

const SubscriptionUpdatedEventSchema = z.object({
  id: z.string(),
});

const SubscriptionDeletedSchema = z.object({
  id: z.string(),
  cancel_at: z.number(),
  canceled_at: z.number(),
});

async function getStripeEvent(request: Request): Promise<Stripe.Event> {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    throw new Error("Missing Stripe signature");
  }
  try {
    const stripePayload = await request.text();
    return stripe.webhooks.constructEvent(
      stripePayload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (e: any) {
    throw new Error("Failed to get Stripe event: " + e.message);
  }
}

const handleCheckoutSessionCompleted = async (data: any) => {
  const parsed = CheckoutSessionCompletedSchema.parse(data);
  await updateStripeSubscription(parsed.subscription, {
    metadata: {
      organizationId: parsed.metadata.organizationId,
    },
  });

  const subscription = await retrieveStripeSubscription(parsed.subscription);
  const item = subscription.items.data[0];
  await insertSubscription({
    organizationId: parseInt(subscription.metadata.organizationId),
    createdAt: new Date(subscription.created * 1000),
    expiresAt: new Date(subscription.current_period_end * 1000),
    externalId: subscription.id,
    externalCustomerId: subscription.customer.toString(),
    externalPriceId: item.plan.id,
    // A subscription in this context can never have a DeletedProduct so
    // we can safely cast this to a string.
    externalProductId: item.plan.product?.toString() as string,
  });
};

const handleSubscriptionUpdatedEvent = async (data: any) => {
  const parsed = SubscriptionUpdatedEventSchema.parse(data);
  const stripeSubscription = await retrieveStripeSubscription(parsed.id);
  const dbSubscription = await findSubscriptionByExternalId(parsed.id);
  if (!dbSubscription) {
    throw new SubscriptionNotFoundError(parsed.id);
  }
  // @ts-expect-error
  const { id: priceId, product: productId } = stripeSubscription.plan!;
  if (
    priceId !== dbSubscription.externalPriceId ||
    productId !== dbSubscription.externalProductId
  ) {
    await updateSubscription(dbSubscription.id!, {
      externalPriceId: priceId,
      externalProductId: productId,
    });
  }
};

const handleSubscriptionDeleted = async (data: any) => {
  const parsed = SubscriptionDeletedSchema.parse(data);
  const subscription = await findSubscriptionByExternalId(data.id);
  if (!subscription) {
    throw new SubscriptionNotFoundError(parsed.id);
  }
  await updateSubscriptionDeleted(
    subscription.id,
    parsed.cancel_at * 1000,
    parsed.canceled_at * 1000,
  );
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const event = await getStripeEvent(request);
  const eventType = event.type;
  const data = event.data.object;
  switch (eventType) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(data);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdatedEvent(data);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(data);
      break;
    default:
      break;
  }
  return null;
};
