import type { LoaderFunctionArgs } from "@remix-run/node";
import { defer, redirect } from "@remix-run/node";
import { Outlet, useLoaderData, useRevalidator } from "@remix-run/react";
import { config } from "~/components/dashboard/config";
import DashboardSidebar from "~/components/dashboard/dashboard-sidebar";
import { DashboardSkeleton } from "~/components/dashboard/dashboard-skeleton";
import { findOrganizationInvitationsByEmail } from "~/services/db/organization-invitation.server";
import {
  findOrganizationById,
  findUserOrganizations,
} from "~/services/db/organizations.server";
import { findSubscriptionByOrganizationId } from "~/services/db/subscriptions.server";
import { findUserById } from "~/services/db/users.server";
import { getUserIdFromSessionWithIdentity } from "~/utils/sessions.server";
import { generateProfilePicUrl } from "~/utils/user.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { userId, authMethod, identityVerified } =
    await getUserIdFromSessionWithIdentity(request);

  if (authMethod === "email" && !identityVerified) {
    return redirect("/verify-email");
  }

  const user = await findUserById(userId);
  if (!user.defaultOrganizationId || user.onboardingStatus !== "complete") {
    return redirect("/dashboard/onboarding");
  }
  const defaultOrganization = await findOrganizationById(
    user.defaultOrganizationId,
  );
  if (!defaultOrganization) {
    return redirect("/dashboard/onboarding");
  }
  const subscription = await findSubscriptionByOrganizationId(
    user.defaultOrganizationId,
  );
  if (!subscription) {
    throw redirect("/subscribe");
  }
  const organizationInvitations = findOrganizationInvitationsByEmail(
    user.email,
  );
  const url = new URL(request.url);
  if (url.pathname.replaceAll("/", "") === "dashboard") {
    return redirect("/dashboard/issues");
  }
  await generateProfilePicUrl(user);
  return defer({
    user,
    organizations: findUserOrganizations(user.id),
    defaultOrganization,
    organizationInvitations,
  });
}

export default function Dashboard() {
  const { user, organizations, defaultOrganization, organizationInvitations } =
    useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const isRevalidating = revalidator.state === "loading";

  return (
    <div>
      <DashboardSidebar
        organizations={organizations}
        defaultOrganization={defaultOrganization}
        user={user}
        items={config.nav}
        organizationInvitationsPromise={organizationInvitations}
        isLoading={isRevalidating}
      />
      <main className="py-4 sm:py-8 lg:pl-72">
        <div className="flex w-full px-0 sm:px-6 lg:px-8">
          {isRevalidating ? <DashboardSkeleton /> : <Outlet />}
        </div>
      </main>
    </div>
  );
}
