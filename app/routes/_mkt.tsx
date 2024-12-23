import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { config } from "~/components/marketing/config";
import { Footer } from "~/components/marketing/footer";
import { MainNav } from "~/components/marketing/main-nav";
import { MobileNav } from "~/components/marketing/mobile-nav";
import { ThemeCustomiser } from "~/components/marketing/theme-customiser";
import { ModeToggle } from "~/components/mode-toggle";
import { buttonVariants } from "~/components/ui/button";
import { appConfig } from "~/config/app.server";
import { cn } from "~/lib/utils";
import { getUserIdFromSession } from "~/utils/sessions.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  let isUserLoggedIn;
  try {
    await getUserIdFromSession(request);
    isUserLoggedIn = true;
  } catch (e) {
    isUserLoggedIn = false;
  }
  return { isUserLoggedIn, appName: appConfig.name };
};

export default function Index() {
  const { isUserLoggedIn, appName } = useLoaderData<typeof loader>();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <MobileNav items={config.nav} appName={appName} />
          <MainNav items={config.nav} appName={appName} />
          <nav className={"flex flex-row items-center space-x-2"}>
            <ThemeCustomiser />
            <ModeToggle />
            {isUserLoggedIn ? (
              <Link
                to="/dashboard"
                prefetch={"intent"}
                className={cn(
                  buttonVariants({ variant: "secondary", size: "sm" }),
                  "px-4",
                )}
              >
                Go to app
              </Link>
            ) : (
              <>
                <Link
                  prefetch={"viewport"}
                  to="/login"
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "sm" }),
                    "px-4",
                  )}
                >
                  Login
                </Link>
                <Link
                  prefetch={"viewport"}
                  to="/register"
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "px-4",
                  )}
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
