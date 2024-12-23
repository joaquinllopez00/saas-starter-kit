import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { onboardingSteps } from "~/components/onboarding/onboarding";
import type { OnboardingStepProps } from "~/components/onboarding/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { findOrganizationInvitationsByEmail } from "~/services/db/organization-invitation.server";
import { findUserOrganizations } from "~/services/db/organizations.server";
import { findUserById } from "~/services/db/users.server";
import { getUserIdFromSessionWithIdentity } from "~/utils/sessions.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { userId, authMethod, identityVerified } =
    await getUserIdFromSessionWithIdentity(request);
  const user = await findUserById(userId);

  if (authMethod === "email" && !identityVerified) {
    return redirect("/verify-email");
  }

  const invitations = await findOrganizationInvitationsByEmail(user.email);
  const organizations = await findUserOrganizations(user.id);

  const url = new URL(request.url);

  if (user.onboardingStatus === "complete" && invitations.length == 0) {
    return redirect("/dashboard");
  }

  if (url.pathname.replaceAll("/", "").endsWith("onboarding")) {
    if (invitations.length > 0) {
      return redirect("/dashboard/onboarding/invitations");
    }
    if (organizations.length === 0) {
      return redirect("/dashboard/onboarding/organization");
    } else {
      return redirect("/dashboard/onboarding/members");
    }
  }

  const currentStepPath = url.pathname.split("/").pop();
  let currentStep =
    onboardingSteps.find((step) => step.href === currentStepPath) ||
    onboardingSteps[0];
  return { currentStepId: currentStep.id };
};

export default function DashboardOnboarding() {
  const loaderData = useLoaderData<typeof loader>();
  const currentStep = onboardingSteps.find(
    (o) => o.id === loaderData.currentStepId,
  ) as OnboardingStepProps;
  const Icon = currentStep.icon;
  return (
    <div className={"h-screen bg-secondary px-2 py-10 md:px-10"}>
      <div
        className={
          "mx-auto flex max-w-2xl flex-col items-center justify-center pt-32"
        }
      >
        <Card className={"mt-4 flex w-full flex-col md:mt-6"}>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="flex flex-col items-center gap-1">
              <Icon className={"h-8 w-8 stroke-1 text-muted-foreground"} />
              {currentStep?.title}
            </CardTitle>
            <CardDescription>{currentStep?.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Outlet />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
