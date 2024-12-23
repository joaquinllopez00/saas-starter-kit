export type SubscriptionSchedule = "monthly" | "yearly";
export type SubscriptionFeatureValue = number | boolean;
export type SubscriptionFeature = {
  name: string;
  key: string;
  value: SubscriptionFeatureValue;
  description: string;
};
export type CustomerSubscription = {
  product: {
    name: string;
    schedule: SubscriptionSchedule;
    priceString: string;
  };
  nextPaymentDate: number;
};
export type PaymentsService = {
  listSubscriptionTiers: () => Promise<SubscriptionTier[]>;
  getBillingPortalLink: (
    customerId: string,
    returnRoute?: string,
  ) => Promise<string>;
  getCheckoutLink: (
    priceId: string,
    email: string,
    organizationId: number,
    customer?: string,
  ) => Promise<string>;
  getCustomerSubscription: (
    externalId: string,
  ) => Promise<CustomerSubscription>;
};
export type SubscriptionTier = {
  id: string;
  name: string;
  priceId: string;
  priceNumber: number;
  priceString: string;
  description: string;
  schedule: SubscriptionSchedule;
  features: SubscriptionFeature[];
  isRecommended?: boolean;
};

export type FeatureKey = "users" | "projects" | "storage" | "support";

export type SubscriptionDictionary = Record<
  string,
  Pick<SubscriptionTier, "features" | "isRecommended">
>;
