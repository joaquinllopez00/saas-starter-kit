import { CheckCircledIcon } from "@radix-ui/react-icons";
import { Form } from "@remix-run/react";
import { Asterisk } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type {
  FeatureKey,
  SubscriptionFeature,
  SubscriptionTier,
} from "~/services/payments/types";

export default function SubscriptionTierColumn({
  schedule,
  subscriptionTier,
  mode = "subscribe",
  highlightedFeature,
  currentSubscriptionProductId,
}: {
  schedule: string;
  subscriptionTier: SubscriptionTier;
  mode?: "subscribe" | "upgrade" | "get-started";
  highlightedFeature?: FeatureKey;
  currentSubscriptionProductId?: string;
}) {
  const isCurrentSubscription =
    currentSubscriptionProductId === subscriptionTier.id;

  return (
    <div
      key={subscriptionTier.id}
      className={cn(
        isCurrentSubscription
          ? "border"
          : subscriptionTier.isRecommended
          ? "border-2 border-primary"
          : "border border-muted",
        "rounded-3xl p-8 xl:p-10",
      )}
    >
      <div className="flex items-center justify-between gap-x-4">
        <h3
          id={subscriptionTier.id}
          className={cn(
            isCurrentSubscription
              ? "text-foreground"
              : subscriptionTier.isRecommended
              ? "text-primary"
              : "text-foreground",
            "text-lg font-semibold leading-8",
          )}
        >
          {subscriptionTier.name}
        </h3>
        {isCurrentSubscription ? (
          <p className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold leading-5 text-foreground">
            Current plan
          </p>
        ) : subscriptionTier.isRecommended ? (
          <Badge>Most popular</Badge>
        ) : null}
      </div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        {subscriptionTier.description}
      </p>
      <p className="mt-6 flex items-baseline gap-x-1">
        <span className="text-4xl font-bold tracking-tight text-foreground">
          {subscriptionTier.priceString}
        </span>
        <span className="text-sm font-semibold leading-6 text-muted-foreground">
          {schedule}
        </span>
      </p>
      <Form method={"POST"} className={"mt-6 w-full"}>
        <input
          hidden
          readOnly
          value={subscriptionTier.priceId}
          name={"priceId"}
        />
        <Button
          className={"w-full"}
          type={"submit"}
          color={"primary"}
          variant={
            isCurrentSubscription
              ? "secondary"
              : subscriptionTier.isRecommended
              ? "default"
              : "outline"
          }
        >
          {mode === "get-started"
            ? "Get started"
            : isCurrentSubscription
            ? "Current plan"
            : subscriptionTier.isRecommended
            ? "Most popular"
            : "Subscribe"}
        </Button>
      </Form>
      <ul className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground xl:mt-10">
        {subscriptionTier.features.map((feature: SubscriptionFeature) => (
          <li key={feature.key} className={"flex gap-x-3"}>
            <CheckCircledIcon
              className="h-6 w-5 flex-none text-primary"
              aria-hidden="true"
            />
            <div className={"flex flex-row"}>
              <span
                className={
                  highlightedFeature === feature.key
                    ? "underline decoration-primary"
                    : ""
                }
              >
                {feature.description}
              </span>
              {highlightedFeature === feature.key ? (
                <Asterisk className="ml-1 h-4 w-4 text-primary" />
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
