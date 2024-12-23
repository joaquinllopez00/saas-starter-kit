import { ClockIcon, PersonIcon, TrashIcon } from "@radix-ui/react-icons";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import { Link, Outlet, useFetcher } from "@remix-run/react";
import { AlertCircle, PencilIcon } from "lucide-react";
import { cacheClientLoader, useCachedLoaderData } from "remix-client-cache";
import { z } from "zod";
import { UpgradeLink } from "~/components/dashboard/upgrade-link";
import { UserAvatar } from "~/components/dashboard/user-avatar";
import DashboardPageLayout from "~/components/layouts/dashboard-layout";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button, buttonVariants } from "~/components/ui/button";
import { List, ListItem } from "~/components/ui/custom/list";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import { hasPositiveBalance } from "~/services/balance-service.server";
import {
  deleteOrganizationInvitation,
  findOrganizationInvitationById,
  findOrganizationInvitationsByOrganizationId,
} from "~/services/db/organization-invitation.server";
import { validateUserRoleHasPermission } from "~/services/db/permissions.server";
import {
  findUserWithOrganizationById,
  findUsersForOrganization,
} from "~/services/db/users.server";
import { returnJsonSuccessWithToast } from "~/services/toast/toast.server";
import {
  parseFormDataAndValidate,
  returnFormErrorJsonResponse,
  returnFormErrorsJsonResponse,
} from "~/utils/form.server";
import { getUserIdFromSession } from "~/utils/sessions.server";
import { generateProfilePicUrl } from "~/utils/user.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserIdFromSession(request);
  const user = await findUserWithOrganizationById(userId);
  const canManageUsers = await validateUserRoleHasPermission(
    userId,
    ["write"],
    "members",
  );
  const [users, organizationInvitations, isUserBalancePositive] =
    await Promise.all([
      findUsersForOrganization(user.defaultOrganizationId),
      findOrganizationInvitationsByOrganizationId(user.defaultOrganizationId),
      hasPositiveBalance("users", user.defaultOrganizationId),
    ]);

  for (const user of users) {
    if (user.profilePictureFileKey) {
      await generateProfilePicUrl(user);
    }
  }
  return {
    // Show the current user first
    users: users.sort((a, b) => {
      if (a.id === userId) {
        return -1;
      }
      if (b.id === userId) {
        return 1;
      }
      return 0;
    }),
    organizationInvitations,
    readOnly: !canManageUsers,
    needsUpgrade: !isUserBalancePositive,
  };
}

const DeleteInvitedUserSchema = z.object({
  id: z.string().transform((value) => parseInt(value, 10)),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await getUserIdFromSession(request);
  const user = await findUserWithOrganizationById(userId);
  const formPayload = Object.fromEntries(await request.formData());
  if (formPayload._action === "delete") {
    const parsed = await parseFormDataAndValidate(
      request,
      DeleteInvitedUserSchema,
      formPayload,
    );
    if (!parsed.success) {
      return returnFormErrorsJsonResponse(parsed);
    }
    const { id } = parsed.data;
    const organizationInvitation = await findOrganizationInvitationById(
      id,
      user.defaultOrganizationId,
    );
    if (
      !organizationInvitation ||
      organizationInvitation.invitedToOrganizationId !==
        user.defaultOrganizationId
    ) {
      return returnFormErrorJsonResponse<typeof DeleteInvitedUserSchema>(
        "Invited user not found",
        400,
      );
    }
    await deleteOrganizationInvitation(id, user.defaultOrganizationId);
    return returnJsonSuccessWithToast({
      title: "User invite removed",
    });
  }
  return null;
};

export const clientLoader = (args: ClientLoaderFunctionArgs) =>
  cacheClientLoader(args);

clientLoader.hydrate = true;

export default function DashboardMembers() {
  const data = useCachedLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  return (
    <DashboardPageLayout
      title={"Members"}
      headerActions={
        !data.readOnly ? (
          <Link
            to={"invite"}
            className={buttonVariants({ variant: "default", size: "sm" })}
            prefetch={"viewport"}
          >
            Invite
          </Link>
        ) : null
      }
    >
      {data.needsUpgrade && !data.readOnly && (
        <Alert className={"mb-4"}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Limit reached</AlertTitle>
          <AlertDescription>
            <span>
              You have reached the limit of users for your current plan. Please{" "}
              <UpgradeLink featureKey={"users"} /> to add more users.
            </span>
          </AlertDescription>
        </Alert>
      )}
      <List>
        {data.users.map((user) => (
          <ListItem key={user.email}>
            <div className="flex min-w-0 items-center gap-x-4">
              <UserAvatar
                size={"lg"}
                profilePictureUrl={user.profilePictureUrl}
              />
              <div className="min-w-0 flex-auto">
                <p className="text-sm font-semibold leading-6 text-foreground">
                  {user.firstName} {user.lastName}
                </p>
                <p className="mt-0 flex truncate text-xs leading-5 text-secondary-foreground">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-row items-center gap-x-2">
              <div
                className={"flex flex-row items-center text-muted-foreground"}
              >
                <PersonIcon className="mr-1 h-4 w-4" />
                <Badge variant={"secondary"}>
                  <span>{user.role.displayName}</span>
                </Badge>
              </div>
              {!data.readOnly && (
                <Link
                  to={`${user.id}/edit`}
                  className={cn(
                    "text-muted-foreground",
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "hover:text-primary",
                  )}
                >
                  <PencilIcon className={"h-4 w-4"} />
                </Link>
              )}
            </div>
          </ListItem>
        ))}
        {data.organizationInvitations?.map((organizationInvitation) => (
          <li
            key={organizationInvitation.email}
            className="flex items-start justify-between gap-x-6 px-4 py-5"
          >
            <div className="flex min-w-0 items-center gap-x-4">
              <UserAvatar size={"lg"} />
              <div className="min-w-0 flex-auto">
                <p className="mt-1 flex text-xs leading-5 text-secondary-foreground">
                  {organizationInvitation.email}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-row items-center gap-x-2">
              <div
                className={"flex flex-row items-center text-muted-foreground"}
              >
                <ClockIcon className="mr-1 h-4 w-4" />
                <Badge variant={"outline"}>
                  <span>Invited</span>
                </Badge>
              </div>
              {!data.readOnly && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant={"ghost"}
                      size={"sm"}
                      className={"text-muted-foreground hover:text-destructive"}
                    >
                      <TrashIcon className={"h-4 w-4"} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <fetcher.Form method={"post"}>
                      <DialogHeader>
                        <DialogTitle>Remove user invite</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to remove the invite for{" "}
                          {organizationInvitation.email}?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className={"mt-3"}>
                        <input
                          type="hidden"
                          name="id"
                          value={organizationInvitation.id}
                        />
                        <Button type="submit" value={"delete"} name={"_action"}>
                          Yes, delete
                        </Button>
                      </DialogFooter>
                    </fetcher.Form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </li>
        ))}
      </List>
      <Outlet />
    </DashboardPageLayout>
  );
}
