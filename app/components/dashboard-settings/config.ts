import type { DashboardSettingsConfig } from "~/components/dashboard-settings/types";

export const config: DashboardSettingsConfig = {
  nav: [
    {
      title: "Profile",
      href: "profile",
    },
    {
      title: "Security",
      href: "security",
    },
    {
      title: "API keys",
      href: "api",
    },
    {
      title: "Organization",
      href: "organization",
    },
    {
      title: "Billing",
      href: "billing",
      prefetch: "render",
    },
  ],
};
