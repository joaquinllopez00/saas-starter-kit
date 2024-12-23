import { Cross2Icon } from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";

import { Button } from "~/components/ui/button";
import { DataTableViewOptions } from "~/components/ui/data-table/data-table-view-options";
import { Input } from "~/components/ui/input";

import type { DataTableFacetedFilterProps } from "./data-table-faceted-filter";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";

interface DataTableToolbarProps<TData, TValue> {
  table: Table<TData>;
  filterColumnKey?: keyof TData;
  filters?: (Omit<DataTableFacetedFilterProps<TData, TValue>, "column"> & {
    columnKey: keyof TData;
  })[];
}

export function DataTableToolbar<TData, TValue>({
  table,
  filterColumnKey,
  filters,
}: DataTableToolbarProps<TData, TValue>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-col space-y-2 md:flex-row md:space-y-0 items-center space-x-2">
        {filterColumnKey && (
          <Input
            placeholder="Filter issues..."
            value={
              (table
                .getColumn(filterColumnKey as string)
                ?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table
                .getColumn(filterColumnKey as string)
                ?.setFilterValue(event.target.value)
            }
            className="h-10 w-full sm:h-8 sm:w-[300px] lg:w-[250px]"
          />
        )}

        <div className={"flex flex-row space-x-2 w-full md:w-auto"}>
          {filters?.map((filter) => (
            <DataTableFacetedFilter
              key={filter.title}
              column={table.getColumn(filter.columnKey as string)}
              title={filter.title}
              options={filter.options}
            />
          ))}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <Cross2Icon className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
