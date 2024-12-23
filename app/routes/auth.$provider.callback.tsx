import type { LoaderFunctionArgs } from "@remix-run/node";
import { captureObservabilityException } from "~/lib/observability";
import { authenticator } from "~/services/auth/auth.server";
import { ProviderNameSchema } from "~/services/auth/providers/providers";
import {
  insertUserIdentity,
  insertUserWithIdentityProvider,
} from "~/services/db/user-identities.server";
import { findUserByEmailWithIdentities } from "~/services/db/users.server";
import { redirectWithToast } from "~/services/toast/toast.server";
import { createUserSession } from "~/utils/sessions.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const providerName = ProviderNameSchema.parse(params.provider);
  const authResult = await authenticator
    .authenticate(providerName, request, { throwOnError: true })
    .then(
      (data) => ({ success: true, data }) as const,
      (error) => {
        captureObservabilityException(error);
        return { success: false, error } as const;
      },
    );
  if (!authResult.success) {
    captureObservabilityException(authResult);
    return redirectWithToast("/login", {
      title: "Auth Failed",
      description: `There was an error authenticating with ${providerName}.`,
      type: "error",
    });
  }
  const { data: profile } = authResult;
  const userWithIdentities = await findUserByEmailWithIdentities(profile.email);
  // If the user already has an account, link the OAuth identity
  if (
    userWithIdentities &&
    !userWithIdentities.identities.find((i) => i.providerName === providerName)
  ) {
    await insertUserIdentity(userWithIdentities.id, {
      providerUserId: profile.id,
      providerName: providerName,
    });
    return createUserSession(
      userWithIdentities.id,
      "oauth",
      "/dashboard",
      providerName,
    );
  }
  let userId = userWithIdentities?.id;
  if (!userId) {
    const user = await insertUserWithIdentityProvider(
      {
        email: profile.email,
        firstName: profile.name,
      },
      {
        providerName: providerName,
        providerUserId: profile.id,
      },
    );
    userId = user.id;
  }
  return createUserSession(userId, "oauth", "/dashboard", providerName);
};
