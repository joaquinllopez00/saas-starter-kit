import type { LoaderFunctionArgs } from "@remix-run/node";
import { defer } from "@remix-run/node";
import { Await, useLoaderData } from "@remix-run/react";
import { CreditCardIcon, LinkIcon } from "lucide-react";
import { Suspense } from "react";
import { Link } from "react-router-dom";
import {
  SubscriptionBillingPortalSkeleton,
  SubscriptionInformationSkeleton,
} from "~/components/dashboard-settings/billing/skeletons";
import { ViewOnlyAlert } from "~/components/dashboard/view-only-alert";
import DashboardSettingsPageLayout from "~/components/layouts/dashboard-settings-page-layout";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { buttonVariants } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { formatLocalDate } from "~/components/util/date";
import { cn } from "~/lib/utils";
import { validateUserRoleHasPermission } from "~/services/db/permissions.server";
import { findSubscriptionByUserOrganizationId } from "~/services/db/subscriptions.server";
import { paymentsService } from "~/services/payments/payments-service.server";
import { getUserIdFromSession } from "~/utils/sessions.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserIdFromSession(request);
  const dbSubscription = await findSubscriptionByUserOrganizationId(userId);
  if (!dbSubscription) {
    throw new Error(`No subscription found for user organization ${userId}`);
  }
  const canEdit = await validateUserRoleHasPermission(
    userId,
    ["write"],
    "settings",
  );

  const externalSubscription = paymentsService.getCustomerSubscription(
    dbSubscription.externalId,
  );
  if (!canEdit) {
    return defer({
      billingPortalLink: null,
      subscription: externalSubscription,
      readOnly: true,
    });
  }
  const billingPortalLink = paymentsService.getBillingPortalLink(
    dbSubscription?.externalCustomerId,
    "/dashboard/settings/billing",
  );
  return defer({
    billingPortalLink,
    subscription: externalSubscription,
    readOnly: false,
  });
};

export default function DashboardSettingsProfile() {
  const { billingPortalLink, subscription, readOnly } =
    useLoaderData<typeof loader>();
  return (
    <DashboardSettingsPageLayout
      title={"Billing"}
      subtitle={"Manage your billing settings"}
    >
      <>
        {readOnly && (
          <ViewOnlyAlert>
            You don't have permission to manage billing settings.
          </ViewOnlyAlert>
        )}
        <div className={"flex flex-col gap-3"}>
          <Suspense fallback={<SubscriptionInformationSkeleton />}>
            <Await resolve={subscription}>
              {(resolvedSubscription) => (
                <div className={"flex flex-col gap-4 text-sm"}>
                  <div className="grid w-full gap-2">
                    <Label>Plan</Label>
                    <span className={"text-lg font-medium"}>
                      {resolvedSubscription.product.name}{" "}
                      <span
                        className={"text-sm font-normal text-muted-foreground"}
                      >
                        {resolvedSubscription.product.priceString} /{" "}
                        {resolvedSubscription.product.schedule}
                      </span>
                    </span>
                  </div>
                  <div className="grid w-full gap-2">
                    <Label>Billing schedule</Label>
                    <span className={"text-lg font-medium"}>
                      {resolvedSubscription.product.schedule === "monthly"
                        ? "Monthly"
                        : "Yearly"}{" "}
                      <span
                        className={"text-sm font-normal text-muted-foreground"}
                      >
                        Next payment date on{" "}
                        {formatLocalDate(resolvedSubscription.nextPaymentDate)}{" "}
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </Await>
          </Suspense>
          <Suspense fallback={<SubscriptionBillingPortalSkeleton />}>
            <Await resolve={billingPortalLink}>
              {(resolvedLink) => (
                <>
                  {!readOnly && (
                    <div className={"mt-2 flex flex-col gap-4"}>
                      <Alert>
                        <CreditCardIcon className="h-4 w-4" />
                        <AlertTitle>Stripe</AlertTitle>
                        <AlertDescription>
                          Billing is handled by Stripe. You can update your
                          payment method, manage your subscription, and change
                          billing details by clicking the button below.
                        </AlertDescription>
                      </Alert>
                      <div>
                        {resolvedLink && (
                          <Link
                            to={resolvedLink}
                            rel={"noopener noreferrer"}
                            target={"_blank"}
                            className={cn(
                              "flex flex-row",
                              buttonVariants({ variant: "outline" }),
                            )}
                          >
                            <LinkIcon className={"mr-2 h-4 w-4"} />
                            Visit Stripe
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </Await>
          </Suspense>
        </div>
      </>
    </DashboardSettingsPageLayout>
  );
}
