import { InboxIcon, SettingsIcon, UsersIcon } from "lucide-react";

import type { DashboardConfig } from "~/components/dashboard/types";

export const config: DashboardConfig = {
  nav: [
    {
      title: "Issues",
      href: "issues",
      icon: InboxIcon,
    },
    {
      title: "Members",
      href: "members",
      icon: UsersIcon,
    },
    {
      title: "Settings",
      href: "settings",
      icon: SettingsIcon,
    },
  ],
};
