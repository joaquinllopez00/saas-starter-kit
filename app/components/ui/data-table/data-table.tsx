import { useNavigate } from "@remix-run/react";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import React from "react";
import type { DataTableFacetedFilterProps } from "~/components/ui/data-table/data-table-faceted-filter";
import { DataTablePagination } from "~/components/ui/data-table/data-table-pagination";
import { DataTableToolbar } from "~/components/ui/data-table/data-table-toolbar";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumnKey?: keyof TData;
  filters?: (Omit<DataTableFacetedFilterProps<TData, TValue>, "column"> & {
    columnKey: keyof TData;
  })[];
  pagination: {
    pageIndex: number;
    pageSize: number;
    totalItems: number;
  };
  searchParams: URLSearchParams;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumnKey,
  filters,
  pagination,
  searchParams,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const navigate = useNavigate();

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(pagination.totalItems / pagination.pageSize),
    state: {
      pagination: {
        pageIndex: pagination.pageIndex - 1,
        pageSize: pagination.pageSize,
      },
      columnVisibility,
      rowSelection,
      columnFilters,
      sorting,
    },
    manualPagination: true,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newPagination = updater({
          pageIndex: pagination.pageIndex - 1,
          pageSize: pagination.pageSize,
        });
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("page", (newPagination.pageIndex + 1).toString());
        newSearchParams.set("size", newPagination.pageSize.toString());
        navigate(`?${newSearchParams.toString()}`, { replace: true });
      }
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar
        filters={filters}
        filterColumnKey={filterColumnKey}
        table={table}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
