import { NavLink } from "@remix-run/react";
import type { HTMLAttributes } from "react";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface SidebarNavProps extends HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
  }[];
}

export function DashboardSettingsSidebarNav({
  className,
  items,
  ...props
}: SidebarNavProps) {
  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 overflow-x-scroll no-scrollbar",
        className,
      )}
      {...props}
    >
      {items.map((item) => (
        <NavLink
          prefetch={"viewport"}
          key={item.href}
          to={item.href}
          className={({ isActive, isPending }) =>
            cn(
              buttonVariants({ variant: "ghost" }),
              isActive
                ? "bg-secondary"
                : "hover:bg-transparent hover:underline",
              isPending ? "opacity-50" : "",
              "justify-start",
            )
          }
        >
          {item.title}
        </NavLink>
      ))}
    </nav>
  );
}
