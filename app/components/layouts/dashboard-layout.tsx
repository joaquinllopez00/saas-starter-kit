import type { ReactNode } from "react";
import PageHeader from "~/components/dashboard/dashboard-page-header";

export default function DashboardPageLayout({
  title,
  headerActions,
  children,
}: {
  title: string;
  headerActions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={"flex w-full flex-col"}>
      <div
        className={
          "flex w-full flex-row items-center justify-between pr-4 md:pr-6"
        }
      >
        <PageHeader title={title} />
        {headerActions}
      </div>
      <div className={"mt-2 px-4 md:px-6"}>{children}</div>
    </div>
  );
}
