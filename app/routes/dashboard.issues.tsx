import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import { Link, Outlet, useSearchParams } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { EditIcon } from "lucide-react";
import { cacheClientLoader, useCachedLoaderData } from "remix-client-cache";
import { z } from "zod";
import { DashboardSkeleton } from "~/components/dashboard/dashboard-skeleton";
import {
  issueLabelLabels,
  issuePriorityLabels,
  issueStatusLabels,
} from "~/components/issues/labels";
import DashboardPageLayout from "~/components/layouts/dashboard-layout";
import { Badge } from "~/components/ui/badge";
import { buttonVariants } from "~/components/ui/button";
import { DataTable } from "~/components/ui/data-table/data-table";
import { DataTableColumnHeader } from "~/components/ui/data-table/data-table-column-header";
import { DataTableRowActions } from "~/components/ui/data-table/data-table-row-actions";
import { DropdownMenuItem } from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import { findIssuesForUserOrganization } from "~/services/db/issues.server";
import type { Issue } from "~/services/db/types";
import { findUserWithOrganizationById } from "~/services/db/users.server";
import { getUserIdFromSession } from "~/utils/sessions.server";

const PaginationParamsSchema = z.object({
  pageIndex: z.coerce
    .number()
    .int()
    .transform((val) => Math.max(1, val))
    .default(1),

  pageSize: z.coerce
    .number()
    .int()
    .transform((val) => Math.max(10, Math.min(50, val)))
    .default(10),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const { pageIndex, pageSize } = PaginationParamsSchema.parse({
    pageIndex: url.searchParams.get("page"),
    pageSize: url.searchParams.get("size"),
  });

  const userId = await getUserIdFromSession(request);
  const user = await findUserWithOrganizationById(userId);
  const issues = await findIssuesForUserOrganization(user.id, {
    limit: pageSize,
    offset: (pageIndex - 1) * pageSize,
  });

  const allIssues = await findIssuesForUserOrganization(user.id, {
    limit: 1000,
    offset: 0,
  });
  return json({
    issues,
    pagination: {
      pageIndex,
      pageSize,
      totalItems: allIssues.length,
    },
  });
}

export const clientLoader = (args: ClientLoaderFunctionArgs) =>
  cacheClientLoader(args);

clientLoader.hydrate = true;

export function HydrateFallback() {
  return <DashboardSkeleton />;
}

export default function DashboardIssues() {
  const { issues, pagination } = useCachedLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  const columns: ColumnDef<Issue>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => {
        const label = issueLabelLabels.find(
          (label) => label.value === row.original.label,
        );

        return (
          <Link
            to={row.original.id.toString()}
            className="flex space-x-2 cursor-pointer"
          >
            <Link
              to={row.original.id.toString()}
              className="max-w-[500px] truncate font-medium"
            >
              {row.original.title}
            </Link>
            {label && <Badge variant="outline">{label.label}</Badge>}
          </Link>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = issueStatusLabels.find(
          (status) => status.value === row.original.status,
        );

        if (!status) {
          return null;
        }

        return (
          <div className="flex w-[100px] items-center">
            {status.icon && (
              <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
            )}
            <span>{status.label}</span>
          </div>
        );
      },
      filterFn: (row, _, value) => {
        return value.includes(row.original.status);
      },
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }) => {
        const priority = issuePriorityLabels.find(
          (priority) => priority.value === row.original.priority,
        );

        if (!priority) {
          return null;
        }

        return (
          <div className="flex items-center">
            {priority.icon && (
              <priority.icon className="mr-2 h-4 w-4 text-muted-foreground" />
            )}
            <span>{priority.label}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.original.id);
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <DataTableRowActions>
            <DropdownMenuItem asChild className={"cursor-pointer"}>
              <Link to={`${row.original.id}?edit=1`}>
                <EditIcon className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
          </DataTableRowActions>
        );
      },
    },
  ];
  return (
    <DashboardPageLayout
      title={"Issues"}
      headerActions={
        <Link
          to="new"
          className={cn(
            buttonVariants({ variant: "default", size: "sm" }),
            "px-4",
          )}
          prefetch={"viewport"}
        >
          New
        </Link>
      }
    >
      <DataTable
        filterColumnKey={"title"}
        data={issues}
        columns={columns}
        filters={[
          {
            title: "Status",
            options: issueStatusLabels,
            columnKey: "status",
          },
          {
            title: "Priority",
            options: issuePriorityLabels,
            columnKey: "priority",
          },
        ]}
        pagination={pagination}
        searchParams={searchParams}
      />
      <Outlet />
    </DashboardPageLayout>
  );
}
