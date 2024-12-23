import type { IconProperty, NavItem } from "~/components/types";

export type MarketingConfig = {
  nav: NavItem[];
};

export type FeatureProps = {
  name: string;
  description: string;
  icon: IconProperty;
};

export type FaqProps = {
  question: string;
  answer: string;
};
