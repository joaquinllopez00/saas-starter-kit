import { CreditCard, Fingerprint, SettingsIcon, Users } from "lucide-react";
import { Feature } from "~/components/marketing/feature";

import type { FeatureProps } from "~/components/marketing/types";

const features: FeatureProps[] = [
  {
    name: "Authentication",
    description:
      "Seamless authentication, password recovery, and Google auth, all without relying on third-party services",
    icon: Fingerprint,
  },
  {
    name: "Payment processing",
    description:
      "Simplified setup with Stripe or any other payment provider for handling subscriptions and transactions",
    icon: CreditCard,
  },
  {
    name: "Subscription management",
    description:
      "Users can manage their subscriptions and billing information directly from your app",
    icon: SettingsIcon,
  },
  {
    name: "Multi-tenancy support",
    description:
      "Users can be members of multiple organizations, each with their own roles and permissions",
    icon: Users,
  },
];

export const Features = () => {
  return (
    <div id={"features"} className="mx-auto my-12 max-w-7xl">
      <div className="mx-auto max-w-2xl text-center">
        <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Here's where you show off your features
        </p>
        <p className="mt-2 text-lg text-muted-foreground sm:mt-4">
          Use icons and descriptions to highlight the features of your product.
          This is a great place to show off what makes your product unique.
        </p>
      </div>
      <div className="mx-auto mt-10 max-w-2xl sm:mt-16 lg:max-w-4xl">
        <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
          {features.map((feature) => (
            <Feature
              key={feature.name}
              description={feature.description}
              icon={feature.icon}
              name={feature.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
