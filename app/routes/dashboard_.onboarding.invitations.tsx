import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  Link,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { MailIcon } from "lucide-react";
import { Button, buttonVariants } from "~/components/ui/button";
import { List, ListItem } from "~/components/ui/custom/list";
import { cn } from "~/lib/utils";
import { findOrganizationInvitationsByEmail } from "~/services/db/organization-invitation.server";
import { findUserById } from "~/services/db/users.server";
import { getUserIdFromSession } from "~/utils/sessions.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserIdFromSession(request);
  const user = await findUserById(userId);
  const invitations = await findOrganizationInvitationsByEmail(
    user.email,
    true,
  );
  if (!invitations) {
    return redirect("/dashboard/onboarding/organization");
  }
  return { invitations };
};

export default function DashboardOnboardingInvitations() {
  const navigation = useNavigation();
  const loaderData = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const allInvitationsAccepted = loaderData.invitations?.every(
    (invitation) => invitation.isAccepted,
  );
  return (
    <div>
      <List>
        {loaderData.invitations?.length > 0 &&
          loaderData.invitations.map((invitation) => (
            <ListItem key={invitation.id}>
              <div className={"flex flex-col"}>
                <span className={"font-medium"}>
                  {invitation.organization.name}
                </span>
                <div
                  className={"flex flex-row items-center text-muted-foreground"}
                >
                  <MailIcon className={"mr-1 h-4 w-4"} />
                  <span className={"text-sm "}>
                    {invitation.invitedBy.email}
                  </span>
                </div>
              </div>
              <fetcher.Form
                method={"post"}
                action={"/api/organizations/accept-invitation"}
                className={"flex flex-row"}
              >
                <input type={"hidden"} name={"id"} value={invitation.id} />
                <input
                  type={"hidden"}
                  name={"organizationId"}
                  value={invitation.organization.id}
                />
                <Button
                  disabled={
                    invitation.isAccepted || navigation.state === "submitting"
                  }
                  className={"ml-2"}
                  variant={!invitation.isAccepted ? "default" : "secondary"}
                >
                  {invitation.isAccepted ? "Accepted" : "Accept"}
                </Button>
              </fetcher.Form>
            </ListItem>
          ))}
      </List>
      <Link
        className={cn(
          "mt-4 w-full",
          buttonVariants({
            variant: allInvitationsAccepted ? "default" : "secondary",
          }),
        )}
        to={"/dashboard/"}
      >
        {allInvitationsAccepted ? "Next" : "Skip"}
      </Link>
    </div>
  );
}
