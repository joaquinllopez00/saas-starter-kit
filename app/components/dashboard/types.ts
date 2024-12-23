import type { IconProperty, NavItem } from "~/components/types";

export type DashboardNavItem = {
  icon: IconProperty;
} & NavItem;

export type DashboardConfig = {
  nav: DashboardNavItem[];
};
