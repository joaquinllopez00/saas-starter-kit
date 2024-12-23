import type { MarketingConfig } from "~/components/marketing/types";

export const config: MarketingConfig = {
  nav: [
    {
      title: "Home",
      href: "/",
      isMobileOnly: true,
    },
    {
      title: "Features",
      href: "/#features",
    },
    {
      title: "Pricing",
      href: "/pricing",
    },
    {
      title: "Blog",
      href: "/blog",
      prefetch: "render",
    },
  ],
};
