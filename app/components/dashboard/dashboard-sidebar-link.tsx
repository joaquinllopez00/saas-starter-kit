import { NavLink } from "@remix-run/react";
import { cn } from "~/lib/utils";

import type { DashboardNavItem } from "~/components/dashboard/types";

export function DashboardSidebarLink(props: DashboardNavItem) {
  return (
    <NavLink
      prefetch="intent"
      to={props.href}
      className={({ isActive }) =>
        cn(
          isActive
            ? "border border-secondary bg-background font-medium text-foreground"
            : "border border-transparent hover:bg-secondary hover:text-foreground",
          "group flex flex-row items-center gap-x-3 p-2 text-sm leading-6 transition",
        )
      }
    >
      {({ isActive }) => (
        <>
          <props.icon
            className={cn(
              isActive
                ? "text-primary"
                : "text-foreground/70 group-hover:text-foreground",
              "h-6 w-6 shrink-0 stroke-1 transition",
            )}
            aria-hidden="true"
          />
          <span className={cn(isActive ? "text-primary" : "")}>
            {props.title}
          </span>
        </>
      )}
    </NavLink>
  );
}
