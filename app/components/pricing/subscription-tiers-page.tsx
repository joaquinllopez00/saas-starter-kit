import { useState } from "react";
import SubscriptionScheduleSwitcher from "~/components/pricing/subscription-schedule-switcher";
import SubscriptionTierColumn from "~/components/pricing/subscription-tier-column";
import type {
  FeatureKey,
  SubscriptionSchedule,
  SubscriptionTier,
} from "~/services/payments/types";

const gridColsMap: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};
export function SubscriptionTiersPage({
  subscriptionTiers,
  highlightedFeature,
  currentSubscriptionProductId,
  mode,
}: {
  subscriptionTiers: SubscriptionTier[];
  highlightedFeature?: FeatureKey;
  currentSubscriptionProductId?: string;
  mode?: "subscribe" | "upgrade" | "get-started";
}) {
  const [schedule, setSchedule] = useState<SubscriptionSchedule>("yearly");

  const filteredTiers = subscriptionTiers.filter(
    (tier) => tier.schedule === schedule,
  );
  return (
    <div>
      <div className="mt-10 flex justify-center">
        <SubscriptionScheduleSwitcher
          setSchedule={setSchedule}
          schedule={schedule}
          discountPercentage={10}
        />
      </div>
      <div
        className={`isolate mx-auto mt-8 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:${
          gridColsMap[filteredTiers.length] || "grid-cols-3"
        }`}
      >
        {filteredTiers
          .sort((a, b) => a.priceNumber - b.priceNumber)
          .map((subscriptionTier) => (
            <SubscriptionTierColumn
              highlightedFeature={highlightedFeature}
              currentSubscriptionProductId={currentSubscriptionProductId}
              key={subscriptionTier.id}
              subscriptionTier={subscriptionTier}
              schedule={schedule}
              mode={mode}
            />
          ))}
      </div>
    </div>
  );
}
