import { Link } from "@remix-run/react";
import { MenuIcon, Rocket } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import type { NavItem } from "~/components/types";
import { cn } from "~/lib/utils";
import { Button } from "../ui/button";
import OutsideAlerter from "../util/outside-alerter";

function MobileNavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className={"w-full rounded-md p-2 text-sm font-medium hover:underline"}
    >
      {children}
    </Link>
  );
}

export const MobileNav = ({
  items,
  appName,
}: {
  items: NavItem[];
  appName: string;
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  return (
    <div className="-mr-1 ml-2 md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        {showMobileMenu ? <Rocket size={24} /> : <MenuIcon />}
      </Button>
      {showMobileMenu && (
        <OutsideAlerter onClick={() => setShowMobileMenu(false)}>
          <div
            onClick={() => setShowMobileMenu(false)}
            className={cn(
              "fixed inset-0 top-12 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto p-6 pb-32 shadow-md animate-in slide-in-from-bottom-80 md:hidden",
            )}
          >
            <div className="relative z-20 grid gap-0 rounded-md border bg-popover p-4 text-popover-foreground shadow-md">
              <Link to="/" className="flex items-center space-x-2">
                <span className="font-bold">{appName}</span>
              </Link>
              <hr className="my-4 border-t border-secondary" />
              <nav className="grid grid-flow-row auto-rows-max text-sm">
                {items.map((item) => (
                  <MobileNavLink key={item.href} to={item.href}>
                    {item.title}
                  </MobileNavLink>
                ))}
              </nav>
            </div>
          </div>
        </OutsideAlerter>
      )}
    </div>
  );
};
