import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { AlertCircle } from "lucide-react";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { ErrorList } from "~/components/ui/error-list";
import { FormSelect } from "~/components/ui/form/form-select";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { captureObservabilityException } from "~/lib/observability";
import { hasPositiveBalance } from "~/services/balance-service.server";
import { insertOrganizationInvitation } from "~/services/db/organization-invitation.server";
import { findOrganizationById } from "~/services/db/organizations.server";
import { validateUserRoleHasPermission } from "~/services/db/permissions.server";
import { findAllRoles } from "~/services/db/roles.server";
import { findUserWithOrganizationById } from "~/services/db/users.server";
import { sendInviteUserToOrganizationEmail } from "~/services/email/email.server";
import { redirectWithToast } from "~/services/toast/toast.server";
import {
  parseFormDataAndValidate,
  returnFormErrorJsonResponse,
  returnFormErrorsJsonResponse,
} from "~/utils/form.server";
import { getUserIdFromSession } from "~/utils/sessions.server";

const InviteUserSchema = z.object({
  email: z.string().email(),
  roleId: z.string().transform(Number),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserIdFromSession(request);
  const user = await findUserWithOrganizationById(userId);
  const isUserBalancePositive = await hasPositiveBalance(
    "users",
    user.defaultOrganizationId,
  );
  const canEdit = await validateUserRoleHasPermission(
    userId,
    ["write"],
    "members",
  );
  if (!canEdit) {
    return redirect("/dashboard/members");
  }
  const roles = await findAllRoles();
  return { roles, isUserBalancePositive };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const parsed = await parseFormDataAndValidate(request, InviteUserSchema);
  if (!parsed.success) {
    return returnFormErrorsJsonResponse(parsed);
  }
  const userId = await getUserIdFromSession(request);
  const user = await findUserWithOrganizationById(userId);
  const organization = await findOrganizationById(user.defaultOrganizationId);
  if (!organization) {
    return returnFormErrorJsonResponse<typeof InviteUserSchema>(
      "Organization not found",
      404,
    );
  }
  const isUserBalancePositive = await hasPositiveBalance(
    "users",
    user.defaultOrganizationId,
  );

  if (!isUserBalancePositive) {
    return returnFormErrorJsonResponse<typeof InviteUserSchema>(
      "You have reached the limit of users for your current plan.",
      400,
    );
  }
  try {
    sendInviteUserToOrganizationEmail({
      to: parsed.data.email,
      inviterEmail: user.email,
      organizationName: organization.name,
    });
    await insertOrganizationInvitation({
      invitedByUserId: user.id,
      email: parsed.data.email,
      invitedToOrganizationId: organization.id,
      invitedToRoleId: parsed.data.roleId,
    });
  } catch (e) {
    captureObservabilityException(e);
    return returnFormErrorJsonResponse<typeof InviteUserSchema>(
      "Failed to invite user. Please try again.",
      400,
    );
  }
  return redirectWithToast("/dashboard/members", {
    title: "User invited",
  });
};

export default function DashboardMembersInvite() {
  const navigation = useNavigation();
  const loaderData = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const actionData = useActionData<typeof action>();

  return (
    <Dialog open={true} onOpenChange={() => navigate("/dashboard/members")}>
      <DialogContent>
        <Form method="post" className={"space-y-4"}>
          <DialogHeader className={"space-y-2"}>
            <DialogTitle>Invite user</DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>
            <div className={"space-y-4"}>
              {!loaderData.isUserBalancePositive && (
                <Alert className={"mb-4"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Limit reached</AlertTitle>
                  <AlertDescription>
                    You have reached the limit of users for your current plan.
                    Please upgrade to add more users.
                  </AlertDescription>
                </Alert>
              )}
              <div className="grid w-full gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  disabled={!loaderData.isUserBalancePositive}
                  id="email"
                  name="email"
                  type={"email"}
                />
                <ErrorList
                  errors={
                    !actionData?.success ? actionData?.fieldErrors.email : []
                  }
                />
              </div>
              <FormSelect
                label={"Role"}
                name={"roleId"}
                options={loaderData.roles.map((role) => ({
                  label: role.displayName,
                  value: role.id.toString(),
                }))}
                defaultValue={loaderData.roles[0].id.toString()}
                errors={
                  !actionData?.success ? actionData?.fieldErrors.roleId : []
                }
              />
              <ErrorList
                errors={!actionData?.success ? actionData?.formErrors : []}
              />
            </div>
          </DialogDescription>
          <DialogFooter>
            <Button
              disabled={
                !loaderData.isUserBalancePositive ||
                navigation.state === "submitting"
              }
              type={"submit"}
            >
              Invite
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
