import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";
import { findUserOrganizations } from "~/services/db/organizations.server";
import { updateUserDefaultOrganizationId } from "~/services/db/users.server";
import { getUserIdFromSession } from "~/utils/sessions.server";

const SwitchOrganizationSchema = z.object({
  organizationId: z.string().transform((v) => parseInt(v, 10)),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const form = Object.fromEntries(await request.formData());
  const parsed = SwitchOrganizationSchema.safeParse(form);
  if (!parsed.success) {
    return json({ errors: parsed.error }, { status: 400 });
  }
  const userId = await getUserIdFromSession(request);
  const memberships = await findUserOrganizations(userId);
  const membership = memberships.find(
    (m) => m.id === parsed.data.organizationId,
  );
  if (!membership) {
    return json(
      { errors: ["You are not a member of that organization."] },
      { status: 400 },
    );
  }
  await updateUserDefaultOrganizationId(userId, membership.id);
  return json({ message: "success", success: true as const });
};
