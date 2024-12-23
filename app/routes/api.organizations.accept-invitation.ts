import type { ActionFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import {
  acceptOrganizationInvitation,
  findOrganizationInvitationById,
} from "~/services/db/organization-invitation.server";
import { findUserById } from "~/services/db/users.server";
import { returnJsonSuccessWithToast } from "~/services/toast/toast.server";
import {
  parseFormDataAndValidate,
  returnFormErrorJsonResponse,
  returnFormErrorsJsonResponse,
} from "~/utils/form.server";
import { getUserIdFromSession } from "~/utils/sessions.server";

const AcceptInvitationSchema = z.object({
  id: z.string().transform((value) => parseInt(value, 10)),
  organizationId: z.string().transform((value) => parseInt(value, 10)),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const parsed = await parseFormDataAndValidate(
    request,
    AcceptInvitationSchema,
  );
  if (!parsed.success) {
    return returnFormErrorsJsonResponse(parsed);
  }
  const userId = await getUserIdFromSession(request);
  const user = await findUserById(userId);
  const invitation = await findOrganizationInvitationById(
    parsed.data.id,
    parsed.data.organizationId,
  );
  if (!invitation || invitation.email !== user.email.toLowerCase()) {
    return returnFormErrorJsonResponse<typeof AcceptInvitationSchema>(
      "Invitation not found",
      404,
    );
  }
  await acceptOrganizationInvitation(
    parsed.data.id,
    invitation.invitedToRoleId,
    user.email,
    user.id,
    parsed.data.organizationId,
  );
  return returnJsonSuccessWithToast({
    title: "Invitation accepted",
  });
};
