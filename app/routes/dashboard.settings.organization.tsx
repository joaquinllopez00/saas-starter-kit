import DashboardSettingsPageLayout from "~/components/layouts/dashboard-settings-page-layout";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import * as z from "zod";
import { ViewOnlyAlert } from "~/components/dashboard/view-only-alert";
import { Button } from "~/components/ui//button";
import { Input } from "~/components/ui//input";
import { ErrorList } from "~/components/ui/error-list";
import { Label } from "~/components/ui/label";
import {
  findUserDefaultOrganization,
  updateOrganizationName,
} from "~/services/db/organizations.server";
import { validateUserRoleHasPermission } from "~/services/db/permissions.server";
import { findUserWithOrganizationById } from "~/services/db/users.server";
import { returnJsonSuccessWithToast } from "~/services/toast/toast.server";
import {
  parseFormDataAndValidate,
  returnFormErrorJsonResponse,
  returnFormErrorsJsonResponse,
} from "~/utils/form.server";
import { getUserIdFromSession } from "~/utils/sessions.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserIdFromSession(request);
  const organization = await findUserDefaultOrganization(userId);
  const canManageOrganization = await validateUserRoleHasPermission(
    userId,
    ["write"],
    "settings",
  );
  return {
    organizationName: organization?.name,
    readOnly: !canManageOrganization,
  };
};

const OrganizationFormSchema = z.object({
  organizationName: z.string().min(2).max(100),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const parsed = await parseFormDataAndValidate(
    request,
    OrganizationFormSchema,
  );
  if (!parsed.success) {
    return returnFormErrorsJsonResponse(parsed);
  }
  const userId = await getUserIdFromSession(request);
  const canManageOrganization = await validateUserRoleHasPermission(
    userId,
    ["write"],
    "settings",
  );
  if (!canManageOrganization) {
    return returnFormErrorJsonResponse<typeof OrganizationFormSchema>(
      "You do not have permission to update the organization",
      403,
    );
  }

  const user = await findUserWithOrganizationById(userId);
  await updateOrganizationName(
    user.defaultOrganizationId,
    parsed.data.organizationName,
  );
  return returnJsonSuccessWithToast({
    title: "Organization updated",
  });
};

export default function DashboardSettingsOrganization() {
  const { readOnly, organizationName } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const isPending = fetcher.state === "submitting";

  return (
    <DashboardSettingsPageLayout
      title={"Organization"}
      subtitle={"Update your organization details"}
    >
      {readOnly && (
        <ViewOnlyAlert>Only admins can update the organization</ViewOnlyAlert>
      )}
      <fetcher.Form className={"space-y-8"} method={"post"}>
        <div className={"flex flex-col gap-2"}>
          <Label htmlFor="organizationName">Name</Label>
          <Input
            name="organizationName"
            defaultValue={organizationName || ""}
            disabled={readOnly}
          />
          <ErrorList
            errors={
              !fetcher.data?.success
                ? fetcher.data?.fieldErrors.organizationName
                : []
            }
          />
          <ErrorList
            errors={!fetcher.data?.success ? fetcher.data?.formErrors : []}
          />
        </div>
        <Button type="submit" disabled={readOnly || isPending}>
          Save
        </Button>
      </fetcher.Form>
    </DashboardSettingsPageLayout>
  );
}
