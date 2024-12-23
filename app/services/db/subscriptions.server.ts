import { and, eq, isNull } from "drizzle-orm";
import { SubscriptionsTable, UsersTable, db } from "~/drizzle/schema";
import type { Subscription, SubscriptionInsert } from "~/services/db/types";

export const insertSubscription = async (
  subscriptionInsert: SubscriptionInsert,
) => {
  return db.insert(SubscriptionsTable).values(subscriptionInsert).execute();
};

export const updateSubscription = async (
  subscriptionId: number,
  subscriptionUpdate: Partial<SubscriptionInsert>,
) => {
  return db
    .update(SubscriptionsTable)
    .set(subscriptionUpdate)
    .where(eq(SubscriptionsTable.id, subscriptionId))
    .execute();
};

export const findSubscriptionByOrganizationId = async (
  organizationId: number,
): Promise<Subscription | undefined> => {
  const subscriptions = await db
    .select({
      id: SubscriptionsTable.id,
      externalProductId: SubscriptionsTable.externalProductId,
      externalCustomerId: SubscriptionsTable.externalCustomerId,
      externalId: SubscriptionsTable.externalId,
      externalPriceId: SubscriptionsTable.externalPriceId,
    })
    .from(SubscriptionsTable)
    .where(
      and(
        eq(SubscriptionsTable.organizationId, organizationId),
        isNull(SubscriptionsTable.canceledAt),
      ),
    )
    .innerJoin(
      UsersTable,
      eq(UsersTable.defaultOrganizationId, SubscriptionsTable.organizationId),
    )
    .limit(1);

  return subscriptions[0];
};

export const findSubscriptionByUserOrganizationId = async (
  userId: number,
): Promise<Subscription | undefined> => {
  const subscriptions = await db
    .select({
      id: SubscriptionsTable.id,
      externalProductId: SubscriptionsTable.externalProductId,
      externalCustomerId: SubscriptionsTable.externalCustomerId,
      externalId: SubscriptionsTable.externalId,
      externalPriceId: SubscriptionsTable.externalPriceId,
    })
    .from(SubscriptionsTable)
    .where(
      and(
        eq(SubscriptionsTable.organizationId, UsersTable.defaultOrganizationId),
        eq(UsersTable.id, userId),
        isNull(SubscriptionsTable.canceledAt),
      ),
    )
    .innerJoin(
      UsersTable,
      eq(UsersTable.defaultOrganizationId, SubscriptionsTable.organizationId),
    )
    .limit(1);

  return subscriptions[0];
};

export const findSubscriptionByExternalId = async (
  externalId: string,
): Promise<Subscription | undefined> => {
  const subscriptions = await db
    .select({
      id: SubscriptionsTable.id,
      externalProductId: SubscriptionsTable.externalProductId,
      externalCustomerId: SubscriptionsTable.externalCustomerId,
      externalId: SubscriptionsTable.externalId,
      externalPriceId: SubscriptionsTable.externalPriceId,
    })
    .from(SubscriptionsTable)
    .where(
      and(
        eq(SubscriptionsTable.externalId, externalId),
        isNull(SubscriptionsTable.canceledAt),
      ),
    )
    .limit(1);

  return subscriptions[0];
};

export const updateSubscriptionDeleted = async (
  subscriptionId: number,
  cancelAt: number,
  canceledAt: number,
) => {
  return db
    .update(SubscriptionsTable)
    .set({
      cancelAt: new Date(cancelAt),
      canceled: true,
      canceledAt: new Date(canceledAt),
    })
    .where(eq(SubscriptionsTable.id, subscriptionId))
    .execute();
};
