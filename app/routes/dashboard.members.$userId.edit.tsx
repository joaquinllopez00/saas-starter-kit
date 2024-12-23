import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { FormSelect } from "~/components/ui/form/form-select";
import { Input } from "~/components/ui/input";
import { InputDescription } from "~/components/ui/input-description";
import { Label } from "~/components/ui/label";
import { validateUserRoleHasPermission } from "~/services/db/permissions.server";
import { findAllRoles, updateUserRole } from "~/services/db/roles.server";
import { findUserWithOrganizationById } from "~/services/db/users.server";
import { redirectWithToast } from "~/services/toast/toast.server";
import {
  parseFormDataAndValidate,
  returnFormErrorsJsonResponse,
  returnFormFieldErrorJsonResponse,
} from "~/utils/form.server";
import { getUserIdFromSession } from "~/utils/sessions.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await getUserIdFromSession(request);
  const canManageUsers = await validateUserRoleHasPermission(
    userId,
    ["write"],
    "members",
  );
  if (!canManageUsers) {
    return redirect("/dashboard/members");
  }
  const roles = await findAllRoles();
  const user = await findUserWithOrganizationById(Number(params.userId));
  return { user, roles };
}

const EditUserSchema = z.object({
  roleId: z.string().transform(Number),
});
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const parsed = await parseFormDataAndValidate(request, EditUserSchema);
  if (!parsed.success) {
    return returnFormErrorsJsonResponse(parsed);
  }
  const userId = await getUserIdFromSession(request);
  const canManageUsers = await validateUserRoleHasPermission(
    userId,
    ["write"],
    "members",
  );
  if (!canManageUsers) {
    return redirect("/dashboard/members");
  }
  const user = await findUserWithOrganizationById(Number(params.userId));
  try {
    await updateUserRole(
      Number(params.userId),
      user.defaultOrganizationId,
      parsed.data.roleId,
    );
    return redirectWithToast("/dashboard/members", {
      title: "User updated",
    });
  } catch (error: unknown) {
    return returnFormFieldErrorJsonResponse<typeof EditUserSchema>(
      "roleId",
      // @ts-expect-error
      error.message,
    );
  }
};

export default function DashboardMembersUserIdEdit() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const isPending = fetcher.state !== "idle";
  const navigate = useNavigate();

  return (
    <Dialog open={true} onOpenChange={() => navigate("/dashboard/members")}>
      <DialogContent>
        <fetcher.Form method="post" className={"space-y-4"}>
          <DialogHeader className={"space-y-4"}>
            <DialogTitle>
              <>
                {data.user.firstName && data.user.lastName
                  ? `${data.user.firstName} ${data.user.lastName}`
                  : data.user.email}
              </>
            </DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>
            <div className={"space-y-4"}>
              <div className="grid w-full gap-2">
                <Label>Email</Label>
                <Input disabled value={data.user.email} />
                <InputDescription>Email cannot be changed</InputDescription>
              </div>
              <FormSelect
                label={"Role"}
                name={"roleId"}
                options={data.roles.map((role) => ({
                  label: role.displayName,
                  value: role.id.toString(),
                }))}
                defaultValue={data.roles[0].id.toString()}
                errors={
                  // @ts-expect-error
                  !fetcher.data?.success ? fetcher.data?.fieldErrors.roleId : []
                }
              />
            </div>
          </DialogDescription>
          <DialogFooter>
            <Button disabled={isPending} type={"submit"}>
              Save
            </Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}
