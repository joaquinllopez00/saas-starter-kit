import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticator } from "~/services/auth/auth.server";
import { ProviderNameSchema } from "~/services/auth/providers/providers";

export async function loader() {
  return redirect("/login");
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const providerName = ProviderNameSchema.parse(params.provider);
  return await authenticator.authenticate(providerName, request);
};
