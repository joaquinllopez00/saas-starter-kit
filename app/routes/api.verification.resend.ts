import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { generateTotp } from "~/services/auth/utils";
import { findUserById } from "~/services/db/users.server";
import {
  findUnverifiedTokensForUser,
  updateVerificationToken,
} from "~/services/db/verification-tokens.server";
import { sendSignupVerificationEmail } from "~/services/email/email.server";
import { getUserIdFromSession } from "~/utils/sessions.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  let user;
  try {
    const userId = await getUserIdFromSession(request);
    user = await findUserById(userId);
  } catch (e) {
    throw json(
      {
        error: {
          message: "Unauthorized",
        },
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }
  const unverifiedTokens = await findUnverifiedTokensForUser(user.id);
  if (unverifiedTokens.length > 0) {
    const token = unverifiedTokens[0];
    const MINUTE = 1000 * 60;
    const oneMinuteAgo = new Date(Date.now() - MINUTE);
    if (token.updatedAt > oneMinuteAgo) {
      return json(
        {
          error: {
            message: "Please wait a minute before requesting another email",
          },
          message: "Too many requests",
        },
        { status: 429 },
      );
    }
  }

  const { secret, code } = generateTotp(user.email);
  await updateVerificationToken(user.id, "email", { secret, code });
  sendSignupVerificationEmail({
    to: user.email,
    confirmationCode: code,
  });
  return json({ message: "Email sent" });
};
