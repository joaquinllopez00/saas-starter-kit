import { and, eq, gt } from "drizzle-orm";
import { TOTP_EXPIRATION_MINUTES } from "~/config/constants";
import { VerificationTokensTable, db } from "~/drizzle/schema";
import type {
  VerificationToken,
  VerificationTokenInsert,
  VerificationTokenUpdate,
  VerificationType,
} from "~/services/db/types";

const getExpiresAt = (minutes?: number) => {
  const expiresAt = new Date();
  expiresAt.setMinutes(
    expiresAt.getMinutes() + (minutes || TOTP_EXPIRATION_MINUTES),
  );
  return expiresAt;
};

export const findUnverifiedTokensForUser = async (
  userId: number,
): Promise<VerificationToken[]> => {
  return db
    .select({
      id: VerificationTokensTable.id,
      secret: VerificationTokensTable.secret,
      updatedAt: VerificationTokensTable.updatedAt,
    })
    .from(VerificationTokensTable)
    .where(
      and(
        eq(VerificationTokensTable.userId, userId),
        eq(VerificationTokensTable.verified, false),
      ),
    );
};

export const insertVerificationToken = async (
  verificationTokenInsert: VerificationTokenInsert,
): Promise<void> => {
  await db.insert(VerificationTokensTable).values({
    ...verificationTokenInsert,
    expiresAt: getExpiresAt(),
    createdAt: new Date(),
  });
};

export const upsertVerificationToken = async (
  userId: number,
  type: VerificationType,
  verificationTokenInsert: Pick<VerificationTokenInsert, "code" | "secret">,
  expiresAtMinutes?: number,
): Promise<void> => {
  const expiresAt = getExpiresAt(expiresAtMinutes);
  await db
    .insert(VerificationTokensTable)
    .values({
      ...verificationTokenInsert,
      userId,
      type,
      expiresAt,
      createdAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [VerificationTokensTable.userId, VerificationTokensTable.type],
      set: {
        secret: verificationTokenInsert.secret,
        code: verificationTokenInsert.code,
        expiresAt,
        updatedAt: new Date(),
      },
    });
};

export const updateVerificationToken = async (
  userId: number,
  type: VerificationType,
  verificationTokenUpdate: VerificationTokenUpdate,
): Promise<void> => {
  await db
    .update(VerificationTokensTable)
    .set({
      secret: verificationTokenUpdate.secret,
      code: verificationTokenUpdate.code,
      expiresAt: getExpiresAt(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(VerificationTokensTable.userId, userId),
        eq(VerificationTokensTable.type, type),
      ),
    );
};

export const findVerificationTokensForUser = async (
  userId: number,
  type: VerificationType,
  code: string,
): Promise<VerificationToken | undefined> => {
  const tokens = await db
    .select({
      id: VerificationTokensTable.id,
      secret: VerificationTokensTable.secret,
      updatedAt: VerificationTokensTable.updatedAt,
    })
    .from(VerificationTokensTable)
    .where(
      and(
        eq(VerificationTokensTable.userId, userId),
        eq(VerificationTokensTable.type, type),
        eq(VerificationTokensTable.code, code),
        eq(VerificationTokensTable.verified, false),
        gt(VerificationTokensTable.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return tokens[0];
};

export const findVerificationTokenByCode = async (
  code: string,
  type: VerificationType,
): Promise<(VerificationToken & { userId: number }) | undefined> => {
  const tokens = await db
    .select({
      id: VerificationTokensTable.id,
      secret: VerificationTokensTable.secret,
      updatedAt: VerificationTokensTable.updatedAt,
      userId: VerificationTokensTable.userId,
    })
    .from(VerificationTokensTable)
    .where(
      and(
        eq(VerificationTokensTable.code, code),
        eq(VerificationTokensTable.type, type),
        eq(VerificationTokensTable.verified, false),
        gt(VerificationTokensTable.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return tokens[0];
};

export const updateTokenVerified = async (id: number) => {
  return db
    .update(VerificationTokensTable)
    .set({
      verified: true,
      updatedAt: new Date(),
    })
    .where(eq(VerificationTokensTable.id, id));
};

export const deleteVerificationToken = async (id: number): Promise<void> => {
  await db
    .delete(VerificationTokensTable)
    .where(and(eq(VerificationTokensTable.id, id)));
};
