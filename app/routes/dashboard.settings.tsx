import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { config } from "~/components/dashboard-settings/config";
import { DashboardSettingsSidebarNav } from "~/components/dashboard-settings/dashboard-settings-sidebar-nav";
import DashboardPageLayout from "~/components/layouts/dashboard-layout";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  if (url.pathname === "/dashboard/settings") {
    return redirect("/dashboard/settings/profile");
  }
  return null;
}

export default function Settings() {
  return (
    <DashboardPageLayout title={"Settings"}>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="mx-1 sm:-mx-4 lg:w-1/5">
          <DashboardSettingsSidebarNav items={config.nav} />
        </aside>
        <div className="mx-2 flex-1 sm:mx-0 lg:max-w-2xl">
          <Outlet />
        </div>
      </div>
    </DashboardPageLayout>
  );
}
