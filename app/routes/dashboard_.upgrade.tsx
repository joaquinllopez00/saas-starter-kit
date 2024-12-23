import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { SubscriptionTiersHeader } from "~/components/pricing/subscription-tiers-header";
import { SubscriptionTiersPage } from "~/components/pricing/subscription-tiers-page";
import { findSubscriptionByUserOrganizationId } from "~/services/db/subscriptions.server";
import { paymentsService } from "~/services/payments/payments-service.server";
import type { FeatureKey } from "~/services/payments/types";
import { getUserIdFromSession } from "~/utils/sessions.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const featureKey = searchParams.get("feature") as FeatureKey | undefined;
  const userId = await getUserIdFromSession(request);
  const existingUserSubscription =
    await findSubscriptionByUserOrganizationId(userId);
  if (!existingUserSubscription) {
    return redirect("/dashboard");
  }
  const subscriptionTiers = await paymentsService.listSubscriptionTiers();
  return {
    subscriptionTiers,
    currentSubscriptionProductId: existingUserSubscription.externalProductId,
    featureKey,
  };
};

export const action = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserIdFromSession(request);
  const existingUserSubscription =
    await findSubscriptionByUserOrganizationId(userId);

  if (!existingUserSubscription) {
    return redirect("/dashboard");
  }

  const portalLink = await paymentsService.getBillingPortalLink(
    existingUserSubscription.externalCustomerId,
  );
  return redirect(portalLink);
};

export default function DashboardSubscribe() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="bg-background py-20 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SubscriptionTiersHeader />
        <SubscriptionTiersPage
          currentSubscriptionProductId={data.currentSubscriptionProductId}
          highlightedFeature={data.featureKey}
          subscriptionTiers={data.subscriptionTiers}
          mode={"upgrade"}
        />
      </div>
    </div>
  );
}
