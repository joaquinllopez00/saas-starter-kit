import { Await, useLocation } from "@remix-run/react";
import { MenuIcon } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import AccountDropdown from "~/components/dashboard/account-dropdown";
import { DashboardSidebarLink } from "~/components/dashboard/dashboard-sidebar-link";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Skeleton } from "~/components/ui/skeleton";
import type {
  Organization,
  OrganizationInvitationWithOrganization,
  PublicUser,
} from "~/services/db/types";

import type { DashboardConfig } from "~/components/dashboard/types";

export default function DashboardMobileSidebar({
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
  const location = useLocation();
  const [open, setIsOpen] = useState(false);

  // This is a hack required by the fact that ShadCN SheetClose doesn't work
  // for React Router links
  useEffect(() => {
    setIsOpen(false);
  }, [location]);
  return (
    <div>
      {isLoading ? (
        <div className="sticky top-0 z-40 flex flex-row items-center justify-between gap-x-6 border-b-1 border-secondary bg-secondary/30 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <Skeleton className="h-6 w-8" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      ) : (
        <Sheet open={open} onOpenChange={setIsOpen}>
          <div className="sticky top-0 z-40 flex items-center justify-between gap-x-6 border-b-1 border-secondary bg-secondary/30 px-4 py-2 shadow-sm sm:px-6 lg:hidden">
            <SheetTrigger asChild>
              <Button
                variant={"ghost"}
                className="-mx-2.5 px-2.5 text-foreground lg:hidden"
              >
                <span className="sr-only">Open sidebar</span>
                <MenuIcon className="h-6 w-6" aria-hidden="true" />
              </Button>
            </SheetTrigger>
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
          <SheetContent side={"left"} className={"p-0"}>
            <div className="relative h-screen flex-1 bg-secondary/30">
              <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-2">
                <div className="flex shrink-0 flex-row items-center border-b py-4">
                  <span
                    className={
                      "font-display text-xl font-semibold text-foreground"
                    }
                  >
                    {defaultOrganization.name}
                  </span>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul className="-mx-2 space-y-1">
                    {items.map((item) => (
                      <li key={item.title}>
                        <SheetClose asChild>
                          <DashboardSidebarLink
                            title={item.title}
                            href={item.href}
                            icon={item.icon}
                          />
                        </SheetClose>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
