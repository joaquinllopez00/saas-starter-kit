import { ChevronDownIcon } from "@radix-ui/react-icons";
import {
  Await,
  Form,
  Link,
  useFetcher,
  useRevalidator,
} from "@remix-run/react";
import { Building2Icon, LogOutIcon, Moon, Sun, UserIcon } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Theme, useTheme } from "remix-themes";
import { NotificationCircle } from "~/components/dashboard/notification-circle";
import { UserAvatar } from "~/components/dashboard/user-avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type {
  Organization,
  OrganizationInvitationWithOrganization,
  PublicUser,
} from "~/services/db/types";

export default function AccountDropdown({
  user,
  defaultOrganization,
  organizations,
  organizationInvitations,
}: {
  user: PublicUser;
  defaultOrganization: Organization;
  organizations: Promise<Organization[]>;
  organizationInvitations?: OrganizationInvitationWithOrganization[];
}) {
  const switchOrganizationFetcher = useFetcher<{ success: boolean }>();
  const acceptInvitationFetcher = useFetcher<{ success: boolean }>();
  const revalidator = useRevalidator();
  const [wasRevalidated, setWasRevalidated] = useState(false);
  const [theme, setTheme] = useTheme();

  useEffect(() => {
    if (switchOrganizationFetcher.data?.success && !wasRevalidated) {
      revalidator.revalidate();
      setWasRevalidated(true);
    }
  }, [switchOrganizationFetcher.data?.success, revalidator, wasRevalidated]);

  const hasInvitations =
    organizationInvitations && organizationInvitations.length > 0;
  return (
    <div className={"group rounded-md p-2 transition hover:bg-background"}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className={"flex cursor-pointer flex-row items-center relative"}>
            {hasInvitations && (
              <NotificationCircle
                className={"absolute top-0 right-0 z-10 md:left-6"}
                size={"xs"}
              />
            )}
            <UserAvatar
              variant={"secondary"}
              profilePictureUrl={user.profilePictureUrl}
            />
            <span className="hidden w-48 lg:flex lg:items-center">
              <span
                className="ml-4 truncate text-sm leading-6 text-foreground"
                aria-hidden="true"
              >
                {user.email}
              </span>
              <ChevronDownIcon
                className="ml-2 h-5 w-5 text-muted-foreground"
                aria-hidden="true"
              />
            </span>{" "}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              to={"/dashboard/settings/profile"}
              className={"w-full cursor-pointer"}
            >
              <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Building2Icon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Organization</span>
              {hasInvitations && (
                <NotificationCircle className={"ml-2"} size={"xs"} />
              )}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <Suspense fallback={<div>...</div>}>
                  <Await resolve={organizations}>
                    {(resolvedSubscription) => (
                      <>
                        {resolvedSubscription.map(
                          (organization: Organization) => (
                            <DropdownMenuCheckboxItem
                              key={organization.id}
                              onSelect={() => {
                                switchOrganizationFetcher.submit(
                                  {
                                    organizationId: organization.id,
                                  },
                                  {
                                    method: "post",
                                    action: "/api/organizations/switch",
                                  },
                                );
                              }}
                              checked={
                                defaultOrganization.id === organization.id
                              }
                            >
                              {organization.name}
                            </DropdownMenuCheckboxItem>
                          ),
                        )}
                      </>
                    )}
                  </Await>
                </Suspense>
                {hasInvitations && (
                  <>
                    <DropdownMenuSeparator />
                    {organizationInvitations?.map((invitation) => (
                      <DropdownMenuItem key={invitation.organization.id}>
                        <div className={"ml-6 flex flex-row space-x-2"}>
                          <span>{invitation.organization.name}</span>
                          <Button
                            size={"xs"}
                            variant={"secondary"}
                            onClick={() => {
                              acceptInvitationFetcher.submit(
                                {
                                  id: Number(invitation.id),
                                  organizationId: invitation.organization.id,
                                },
                                {
                                  method: "post",
                                  action:
                                    "/api/organizations/accept-invitation",
                                },
                              );
                            }}
                          >
                            Accept invitation
                          </Button>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              {theme === Theme.LIGHT ? (
                <Sun className="mr-2 h-4 w-4 text-muted-foreground" />
              ) : (
                <Moon className="mr-2 h-4 w-4 text-muted-foreground" />
              )}
              <span>Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuCheckboxItem
                  onClick={() => setTheme(Theme.LIGHT)}
                  checked={theme === Theme.LIGHT}
                >
                  Light
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  onClick={() => setTheme(Theme.DARK)}
                  checked={theme === Theme.DARK}
                >
                  Dark
                </DropdownMenuCheckboxItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuItem asChild>
            <Form action="/logout" method="post">
              <button
                type="submit"
                className="flex w-full flex-row items-center"
              >
                <LogOutIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                Logout
              </button>
            </Form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
