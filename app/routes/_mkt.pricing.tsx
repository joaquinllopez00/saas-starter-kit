import { defer, redirect } from "@remix-run/node";
import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { SubscriptionTiersHeader } from "~/components/pricing/subscription-tiers-header";
import { SubscriptionTiersPage } from "~/components/pricing/subscription-tiers-page";
import { SubscriptionTiersPageSkeleton } from "~/components/pricing/subscription-tiers-page-skeleton";
import { paymentsService } from "~/services/payments/payments-service.server";

export const loader = async () => {
  return defer({ subscriptionTiers: paymentsService.listSubscriptionTiers() });
};

export const action = async () => {
  return redirect("/register");
};

export default function Pricing() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <SubscriptionTiersHeader />
      <Suspense fallback={<SubscriptionTiersPageSkeleton />}>
        <Await resolve={data.subscriptionTiers}>
          {(subscriptionTiers) => (
            <SubscriptionTiersPage
              subscriptionTiers={subscriptionTiers}
              mode={"get-started"}
            />
          )}
        </Await>
      </Suspense>
    </div>
  );
}
