import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { ErrorList } from "~/components/ui/error-list";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { findOrganizationInvitationsByEmail } from "~/services/db/organization-invitation.server";
import {
  findUserOrganizations,
  insertOrganization,
} from "~/services/db/organizations.server";
import { findUserById } from "~/services/db/users.server";
import {
  parseFormDataAndValidate,
  returnFormErrorsJsonResponse,
} from "~/utils/form.server";
import { getUserIdFromSession } from "~/utils/sessions.server";

const OrganizationSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, { message: "Name is too short" }),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserIdFromSession(request);
  const user = await findUserById(userId);
  const organizations = await findUserOrganizations(userId);
  if (organizations.length > 0) {
    return redirect("/dashboard/onboarding/members");
  }
  const invitations = await findOrganizationInvitationsByEmail(user.email);
  if (invitations.length > 0) {
    return redirect("/dashboard/onboarding/invitations");
  }
  return { organizations, invitations };
};
export const action = async ({ request }: ActionFunctionArgs) => {
  const parsed = await parseFormDataAndValidate(request, OrganizationSchema);
  if (!parsed.success) {
    return returnFormErrorsJsonResponse(parsed);
  }
  const userId = await getUserIdFromSession(request);
  await insertOrganization(userId, {
    name: parsed.data.name,
  });
  return redirect("/dashboard/onboarding/members");
};

export default function DashboardOnboardingOrganization() {
  const navigation = useNavigation();
  const isPending = navigation.state === "submitting";
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  return (
    <>
      <Form method={"POST"}>
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input name="name" placeholder="Acme LTD." />
          <ErrorList
            errors={!actionData?.success ? actionData?.fieldErrors.name : []}
          />
        </div>
        <Button className={"mt-2 w-full"} type="submit" disabled={isPending}>
          Next
        </Button>
      </Form>
      {loaderData.organizations.length > 0 && (
        <Button
          className={"mt-2 w-full"}
          type="submit"
          disabled={isPending}
          variant={"secondary"}
        >
          Skip
        </Button>
      )}
    </>
  );
}
