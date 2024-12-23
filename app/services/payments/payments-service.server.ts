import { cacheService } from "~/services/cache/cache-service.server";
import {
  generateBillingPortalLink as stripeGenerateBillingPortalLink,
  generatePaymentLink as stripeGeneratePaymentLink,
  getCustomerSubscription as stripeGetCustomerSubscription,
  listSubscriptionTiers as stripeListSubscriptionTiers,
} from "~/services/payments/stripe.server";
import type {
  CustomerSubscription,
  PaymentsService,
  SubscriptionTier,
} from "~/services/payments/types";

const listSubscriptionTiers = async (): Promise<SubscriptionTier[]> => {
  if (cacheService) {
    const cachedTiers = await cacheService.getItem<SubscriptionTier[]>(
      "pricing:subscriptionTiers",
    );
    if (cachedTiers) {
      return cachedTiers;
    }
  }
  const tiers = await stripeListSubscriptionTiers();
  if (cacheService) {
    await cacheService.setItem(
      "pricing:subscriptionTiers",
      JSON.stringify(tiers),
    );
  }
  return tiers;
};

const getBillingPortalLink = (
  customerId: string,
  returnRoute?: string,
): Promise<string> => {
  return stripeGenerateBillingPortalLink(customerId, returnRoute);
};

const getCheckoutLink = (
  priceId: string,
  email: string,
  organizationId: number,
  customer?: string,
): Promise<string> => {
  return stripeGeneratePaymentLink(priceId, email, organizationId, customer);
};

const getCustomerSubscription = async (
  externalId: string,
): Promise<CustomerSubscription> => {
  return stripeGetCustomerSubscription(externalId);
};

export const paymentsService: PaymentsService = {
  listSubscriptionTiers,
  getBillingPortalLink,
  getCheckoutLink,
  getCustomerSubscription,
};
