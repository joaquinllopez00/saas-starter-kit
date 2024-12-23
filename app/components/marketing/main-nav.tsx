import { Link, NavLink } from "@remix-run/react";
import { TestTube } from "lucide-react";
import { cn } from "~/lib/utils";

import type { NavItem } from "~/components/types";

interface MainNavProps {
  items: NavItem[];
  appName: string;
}

export function MainNav({ items, appName }: MainNavProps) {
  return (
    <div className="flex gap-6 md:gap-10">
      <Link to="/" className="hidden items-center space-x-2 md:flex">
        <TestTube size={24} />
        <span className="hidden font-display font-bold sm:inline-block">
          {appName}
        </span>
      </Link>
      {items?.length ? (
        <nav className="hidden gap-6 md:flex">
          {items
            .filter((i) => !i.isMobileOnly)
            ?.map((item, index) => (
              <NavLink
                prefetch={"intent"}
                key={index}
                to={item.disabled ? "#" : item.href}
                className={({ isActive }) => {
                  return cn(
                    "flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm",
                    "text-muted-foreground",
                    isActive && "text-foreground",
                    item.disabled && "cursor-not-allowed opacity-80",
                  );
                }}
              >
                {item.title}
              </NavLink>
            ))}
        </nav>
      ) : null}
    </div>
  );
}
