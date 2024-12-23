import type { LinkProps } from "@remix-run/react";
import type { ForwardRefExoticComponent, Ref } from "react";

export type IconProperty = ForwardRefExoticComponent<any> & {
  ref?: Ref<unknown>;
};

export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
  prefetch?: LinkProps["prefetch"];
  isMobileOnly?: boolean;
};

export type EnumLabelValueConfig<T> = {
  label: string;
  value: T;
  icon?: IconProperty;
};
