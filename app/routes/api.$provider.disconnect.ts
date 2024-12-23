import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { capitalize } from "~/lib/string";
import { ProviderNameSchema } from "~/services/auth/providers/providers";
import { deleteUserIdentity } from "~/services/db/user-identities.server";
import { findUserByIdWithIdentities } from "~/services/db/users.server";
import { returnJsonSuccessWithToast } from "~/services/toast/toast.server";
import {
  getUserIdFromSessionWithIdentity,
  logout,
} from "~/utils/sessions.server";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  try {
    const {
      userId,
      authMethod,
      providerName: currentSessionProviderName,
    } = await getUserIdFromSessionWithIdentity(request);
    const providerName = ProviderNameSchema.parse(params.provider);

    const userWithIdentities = await findUserByIdWithIdentities(userId);
    const userHasProvider = userWithIdentities.identities.some(
      (i) => i.providerName === providerName,
    );
    if (!userHasProvider) {
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
    await deleteUserIdentity(userId, providerName);

    if (authMethod === "oauth" && providerName === currentSessionProviderName) {
      await logout(request);
    }
    return returnJsonSuccessWithToast({
      title: `${capitalize(providerName)} disconnected`,
    });
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
};
