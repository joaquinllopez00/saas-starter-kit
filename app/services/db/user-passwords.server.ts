import { eq } from "drizzle-orm";
import { db, UserPasswordsTable } from "~/drizzle/schema";

export const updateEmailVerified = async (userId: number) => {
  await db
    .update(UserPasswordsTable)
    .set({
      verifiedAt: new Date(),
    })
    .where(eq(UserPasswordsTable.userId, userId));
};

export const findUserPasswordById = async (userId: number) => {
  const userPasswords = await db
    .select({
      verifiedAt: UserPasswordsTable.verifiedAt,
    })
    .from(UserPasswordsTable)
    .where(eq(UserPasswordsTable.userId, userId))
    .limit(1);

  return userPasswords[0];
};

export const updateUserPassword = async (id: number, passwordHash: string) => {
  await db
    .update(UserPasswordsTable)
    .set({
      passwordHash,
    })
    .where(eq(UserPasswordsTable.userId, id));
};

export const insertUserPassword = async ({
  userId,
  passwordHash,
}: {
  userId: number;
  passwordHash: string;
}): Promise<void> => {
  await db.insert(UserPasswordsTable).values({
    userId,
    passwordHash,
  });
};
