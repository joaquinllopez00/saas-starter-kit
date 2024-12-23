import { Await } from "@remix-run/react";
import { Suspense } from "react";
import AccountDropdown from "~/components/dashboard/account-dropdown";
import DashboardMobileSidebar from "~/components/dashboard/dashboard-mobile-sidebar";
import { DashboardSidebarLink } from "~/components/dashboard/dashboard-sidebar-link";
import { Skeleton } from "~/components/ui/skeleton";
import type {
  Organization,
  OrganizationInvitationWithOrganization,
  PublicUser,
} from "~/services/db/types";

import type { DashboardConfig } from "~/components/dashboard/types";

export default function DashboardSidebar({
  user,
  items,
  defaultOrganization,
  organizations,
  organizationInvitationsPromise,
  isLoading,
}: {
  items: DashboardConfig["nav"];
  user: PublicUser;
  defaultOrganization: Organization;
  organizations: Promise<Organization[]>;
  organizationInvitationsPromise: Promise<
    OrganizationInvitationWithOrganization[]
  >;
  isLoading: boolean;
}) {
  return (
    <div>
      <DashboardMobileSidebar
        user={user}
        items={items}
        organizations={organizations}
        defaultOrganization={defaultOrganization}
        organizationInvitationsPromise={organizationInvitationsPromise}
        isLoading={isLoading}
      />
      <aside
        className={
          "hidden min-h-screen border-r border-secondary bg-secondary/30 lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col"
        }
        aria-label={"Sidebar"}
      >
        {isLoading ? (
          <div className={"px-6"}>
            <Skeleton className={"h-7 my-4"} />
            <Skeleton className={"h-9 mt-12 mb-2"} />
            <Skeleton className={"h-9 my-2"} />
            <Skeleton className={"h-9 my-2"} />
          </div>
        ) : (
          <>
            <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6">
              <div className="mt-1 flex shrink-0 flex-row items-center border-b border-secondary py-4">
                <span className={"font-display font-semibold text-foreground"}>
                  {defaultOrganization.name}
                </span>
              </div>
              <nav className="flex flex-1 flex-col">
                <ul className="-mx-2 space-y-2">
                  {items.map((item) => (
                    <li key={item.title}>
                      <DashboardSidebarLink
                        title={item.title}
                        href={item.href}
                        icon={item.icon}
                      />
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <div className={"w-full px-4 py-3"}>
              <Suspense fallback={<div>...</div>}>
                <Await resolve={organizationInvitationsPromise}>
                  {(organizationInvitations) => (
                    <AccountDropdown
                      user={user}
                      defaultOrganization={defaultOrganization}
                      organizations={organizations}
                      organizationInvitations={organizationInvitations}
                    />
                  )}
                </Await>
              </Suspense>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
