import { captureObservabilityException } from "~/lib/observability";
import type { PublicUser } from "~/services/db/types";
import {
  insertUserPassword,
  updateUserPassword,
} from "~/services/db/user-passwords.server";
import {
  findUserById,
  findUserWithPasswordByEmail,
  insertEmailPasswordUser,
} from "~/services/db/users.server";
import { comparePassword, hashPassword } from "~/utils/passwords";

export async function loginEmailPassword({
  email,
  passwordRaw,
}: {
  email: string;
  passwordRaw: string;
}): Promise<PublicUser | null> {
  const userInternal = await findUserWithPasswordByEmail(email);
  if (!userInternal) {
    captureObservabilityException(new Error("No user"));
    return null;
  }
  const isCorrectPassword = await comparePassword(
    passwordRaw,
    userInternal.passwordHash,
  );
  if (!isCorrectPassword) {
    return null;
  }
  return findUserById(userInternal.id);
}

export async function registerEmailPasswordUser({
  email,
  passwordRaw,
  isVerified,
}: {
  email: string;
  passwordRaw: string;
  isVerified?: boolean;
}): Promise<PublicUser> {
  const passwordHash = await hashPassword(passwordRaw);
  return insertEmailPasswordUser({ email }, { passwordHash }, isVerified);
}

export async function linkEmailPasswordIdentity({
  userId,
  passwordRaw,
}: {
  userId: number;
  passwordRaw: string;
}): Promise<void> {
  const passwordHash = await hashPassword(passwordRaw);
  return insertUserPassword({ userId, passwordHash });
}

export async function updateEmailPasswordUser({
  userId,
  passwordRaw,
}: {
  userId: number;
  passwordRaw: string;
}): Promise<void> {
  const newHashedPassword = await hashPassword(passwordRaw);
  await updateUserPassword(userId, newHashedPassword);
}
