import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { AnnouncementBanner } from "~/components/announcement-banner";
import { SubscriptionTiersHeader } from "~/components/pricing/subscription-tiers-header";
import { SubscriptionTiersPage } from "~/components/pricing/subscription-tiers-page";
import { findSubscriptionByUserOrganizationId } from "~/services/db/subscriptions.server";
import { findUserWithOrganizationById } from "~/services/db/users.server";
import { paymentsService } from "~/services/payments/payments-service.server";
import { getUserIdFromSession } from "~/utils/sessions.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserIdFromSession(request);
  const existingUserSubscription =
    await findSubscriptionByUserOrganizationId(userId);
  if (existingUserSubscription) {
    return redirect("/dashboard");
  }
  const subscriptionTiers = await paymentsService.listSubscriptionTiers();
  return { productsWithPrices: subscriptionTiers };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  if (!formData.has("priceId")) {
    return redirect("/subscribe");
  }

  const userId = await getUserIdFromSession(request);
  const user = await findUserWithOrganizationById(userId);

  const paymentLink = await paymentsService.getCheckoutLink(
    String(formData.get("priceId")),
    user.email,
    user.defaultOrganizationId,
  );
  return redirect(paymentLink);
};

export default function DashboardSubscribe() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="bg-background py-20 sm:py-16">
      <AnnouncementBanner
        message={
          "This is a demo site, no real money will be charged. You can use the following test card: 4242 4242 4242 4242, any future date, any CVC."
        }
      />
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SubscriptionTiersHeader />
        <SubscriptionTiersPage subscriptionTiers={data.productsWithPrices} />
      </div>
    </div>
  );
}
