import { EnvelopeClosedIcon } from "@radix-ui/react-icons";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { OnboardingCompleteDialog } from "~/components/onboarding/onboarding-complete-dialog";
import { Button } from "~/components/ui/button";
import { ErrorList } from "~/components/ui/error-list";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { adminRoleName } from "~/drizzle/constants";
import { captureObservabilityException } from "~/lib/observability";
import {
  deleteOrganizationInvitation,
  findOrganizationInvitationsByInvitedUserId,
  insertOrganizationInvitation,
} from "~/services/db/organization-invitation.server";
import { findOrganizationById } from "~/services/db/organizations.server";
import { findRoleByName } from "~/services/db/roles.server";
import {
  findUserWithOrganizationById,
  updateUserOnboardingStatus,
} from "~/services/db/users.server";
import { sendInviteUserToOrganizationEmail } from "~/services/email/email.server";
import {
  parseFormDataAndValidate,
  returnFormErrorJsonResponse,
  returnFormErrorsJsonResponse,
  returnFormFieldErrorJsonResponse,
} from "~/utils/form.server";
import { getUserIdFromSession } from "~/utils/sessions.server";

const InviteEmailSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email" }),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserIdFromSession(request);
  const user = await findUserWithOrganizationById(userId);
  if (!user.defaultOrganizationId) {
    return redirect("/dashboard/onboarding/organization");
  }
  const organizationInvitations =
    await findOrganizationInvitationsByInvitedUserId(user.id);
  return { organizationInvitations };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formPayload = Object.fromEntries(await request.formData());
  const userId = await getUserIdFromSession(request);
  const user = await findUserWithOrganizationById(userId);

  if (formPayload._action === "skip" || formPayload._action === "submit") {
    await updateUserOnboardingStatus(user.id, "complete");
    const invitations = await findOrganizationInvitationsByInvitedUserId(
      user.id,
    );
    const organization = await findOrganizationById(user.defaultOrganizationId);
    if (!organization) {
      return returnFormErrorJsonResponse<typeof InviteEmailSchema>(
        "Organization not found",
        500,
      );
    }
    for (const invitation of invitations) {
      sendInviteUserToOrganizationEmail({
        to: invitation.email,
        inviterEmail: user.email,
        organizationName: organization.name,
      });
    }
  }
  if (formPayload._action === "add") {
    const parsed = await parseFormDataAndValidate(
      request,
      InviteEmailSchema,
      formPayload,
    );
    if (!parsed.success) {
      return returnFormErrorsJsonResponse(parsed);
    }
    const userId = await getUserIdFromSession(request);
    const adminRole = await findRoleByName(adminRoleName);
    if (!adminRole) {
      return returnFormErrorJsonResponse<typeof InviteEmailSchema>(
        "Admin role not found",
        500,
      );
    }
    try {
      await insertOrganizationInvitation({
        invitedByUserId: userId,
        email: parsed.data.email,
        invitedToOrganizationId: user.defaultOrganizationId,
        invitedToRoleId: adminRole.id,
      });
    } catch (e) {
      captureObservabilityException(e);
      return returnFormFieldErrorJsonResponse<typeof InviteEmailSchema>(
        "email",
        "Email already invited",
        400,
      );
    }
  } else if (formPayload._action === "delete") {
    const invitedUserId = Number(formPayload.invitedUserId);
    await deleteOrganizationInvitation(
      invitedUserId,
      user.defaultOrganizationId,
    );
  }
  return null;
};

export default function DashboardOnboardingMembers() {
  const navigation = useNavigation();
  const isPending = navigation.state === "submitting";
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [showOnboardingComplete, setShowOnboardingComplete] = useState(false);
  const fetcher = useFetcher();

  const isAdding = fetcher.state == "submitting";
  const formRef = useRef<HTMLFormElement>(null);
  const formAction = fetcher.formData?.get("_action");

  useEffect(() => {
    if (!isPending && (formAction === "submit" || formAction === "skip")) {
      setShowOnboardingComplete(true);
    }
  }, [formAction, isPending]);

  useEffect(() => {
    if (!isAdding) {
      formRef.current?.reset();
    }
  }, [isAdding]);

  return (
    <div>
      <OnboardingCompleteDialog open={showOnboardingComplete} />
      <fetcher.Form method={"post"} className="grid w-full gap-2" ref={formRef}>
        <Label htmlFor="email">Email</Label>
        <div className={"flex flex-row items-center gap-2"}>
          <Input name="email" placeholder="john@doe.com" type={"email"} />
          <Button
            type="submit"
            name={"_action"}
            value={"add"}
            disabled={isPending}
          >
            Invite
          </Button>
          <ErrorList
            errors={!actionData?.success ? actionData?.fieldErrors.email : []}
          />
        </div>
      </fetcher.Form>
      <fetcher.Form method={"post"}>
        <Button
          className={"mt-2 w-full"}
          type="submit"
          name={"_action"}
          value={"submit"}
          variant={"secondary"}
          disabled={isPending}
        >
          Next
        </Button>
      </fetcher.Form>
      <fetcher.Form method={"post"}>
        <Button
          className={"mt-2 w-full"}
          type="submit"
          variant={"link"}
          name={"_action"}
          value={"skip"}
          disabled={isPending}
        >
          Skip
        </Button>
      </fetcher.Form>
      <div className={"mt-4 flex flex-col"}>
        {loaderData?.organizationInvitations?.map((user) => (
          <fetcher.Form
            method={"delete"}
            key={user.id}
            className={
              "flex flex-row items-center justify-between border-t-2 border-t-secondary px-3 py-3"
            }
          >
            <div className={"flex flex-row items-center space-x-2 stroke-2"}>
              <EnvelopeClosedIcon className={"h-4 w-4 text-muted-foreground"} />
              <span className={"text-sm"}>{user.email}</span>
            </div>
            <input type={"hidden"} name={"invitedUserId"} value={user.id} />
            <Button
              name={"_action"}
              size="sm"
              value={"delete"}
              type={"submit"}
              variant={"secondary"}
            >
              <XIcon className={"h-4 w-4"} />
            </Button>
          </fetcher.Form>
        ))}
      </div>
    </div>
  );
}
