import { captureObservabilityException } from "~/lib/observability";
import { findOrganizationInvitationsByOrganizationId } from "~/services/db/organization-invitation.server";
import { findSubscriptionByOrganizationId } from "~/services/db/subscriptions.server";
import { findUsersForOrganization } from "~/services/db/users.server";
import { subscriptionTiers } from "~/services/payments/subscription";
import type {
  FeatureKey,
  SubscriptionFeatureValue,
} from "~/services/payments/types";

const BALANCE_UNLIMITED = -1;

const userBalanceHandler = async ({
  organizationId,
  value,
}: {
  organizationId: number;
  value: SubscriptionFeatureValue;
}) => {
  const users = await findUsersForOrganization(organizationId);
  const invitedUsers =
    await findOrganizationInvitationsByOrganizationId(organizationId);
  return (
    Number(value) - (users.length + invitedUsers.length) > 0 ||
    value === BALANCE_UNLIMITED
  );
};

export const hasPositiveBalance = async (
  featureKey: FeatureKey,
  organizationId: number,
): Promise<boolean> => {
  const subscription = await findSubscriptionByOrganizationId(organizationId);
  if (!subscription) {
    return false;
  }
  const subscriptionConfig = subscriptionTiers[subscription.externalProductId];
  let balance = false;
  if (!subscriptionConfig) {
    captureObservabilityException(
      new Error(`Subscription ${subscription.externalProductId} not found`),
    );
    return false;
  }
  const featureConfig = subscriptionConfig.features.find(
    (f) => f.key === featureKey,
  );
  if (!featureConfig) {
    captureObservabilityException(new Error(`Feature ${featureKey} not found`));
    return false;
  }
  if (featureKey === "users") {
    balance = await userBalanceHandler({
      organizationId,
      value: featureConfig.value,
    });
  }
  return balance;
};
