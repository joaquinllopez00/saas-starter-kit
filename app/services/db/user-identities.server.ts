import { and, eq } from "drizzle-orm";
import { UserIdentitiesTable, UsersTable, db } from "~/drizzle/schema";
import type { ProviderName } from "~/services/auth/types";
import type {
  PublicUser,
  UserIdentityInsert,
  UserInsert,
} from "~/services/db/types";

export const insertUserIdentity = async (
  userId: number,
  providerInsert: UserIdentityInsert,
): Promise<void> => {
  await db.insert(UserIdentitiesTable).values({
    userId: userId,
    providerName: providerInsert.providerName,
    providerUserId: providerInsert.providerUserId,
  });
};

export const insertUserWithIdentityProvider = async (
  user: UserInsert,
  providerInsert: UserIdentityInsert,
): Promise<PublicUser> => {
  return await db.transaction(async (tx) => {
    const newUser = await tx
      .insert(UsersTable)
      .values({
        ...user,
        email: user.email.toLowerCase(),
      })
      .returning();
    await tx.insert(UserIdentitiesTable).values({
      userId: newUser[0].id!,
      providerName: providerInsert.providerName,
      providerUserId: providerInsert.providerUserId,
    });
    return newUser[0];
  });
};

export const deleteUserIdentity = async (
  userId: number,
  providerName: ProviderName,
): Promise<void> => {
  await db
    .delete(UserIdentitiesTable)
    .where(
      and(
        eq(UserIdentitiesTable.userId, userId),
        eq(UserIdentitiesTable.providerName, providerName),
      ),
    );
};
