import { useCallback, useMemo, useState } from "react";
import { EnumParamValue } from "./table-export";
import { DataTableProps } from "./types";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  Updater,
  useReactTable,
} from "@tanstack/react-table";
import {
  PaginationStrategyFactory,
  TableStateManager,
  URLParameterManager,
} from "./utils";

export default function useDataTableLogic<
  TData,
  TValue,
  TEnum extends Record<string, EnumParamValue>,
>(props: DataTableProps<TData, TValue, TEnum>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pagination, useQueryParams = false, data, columns } = props;

  // Core table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [isLoading, setIsLoading] = useState(false); //a use state for loading

  // URL parameter management
  const urlManager = useMemo(
    () => new URLParameterManager(router, searchParams, useQueryParams),
    [router, searchParams, useQueryParams],
  );

  // Pagination state
  const [, setInternalPaginationState] = useState<PaginationState>(() =>
    urlManager.getInitialPagination(),
  );

  // Strategy pattern for pagination
  const paginationStrategy = useMemo(
    () =>
      PaginationStrategyFactory.create(
        pagination,
        useQueryParams,
        urlManager,
        setInternalPaginationState,
      ),
    [pagination, useQueryParams, urlManager],
  );

  const tableStateManager = useMemo(
    () => new TableStateManager(paginationStrategy),
    [paginationStrategy],
  );

  // Current pagination state
  const currentPaginationState = useMemo(
    () => paginationStrategy.getInitialState(),
    [paginationStrategy],
  );

  // Table configuration
  const tableConfig = tableStateManager.getTableConfig();

  // Handle pagination changes
  const handlePaginationChange = useCallback(
    (updater: Updater<PaginationState>) => {
      setIsLoading(true); //set is loading state
      paginationStrategy.handleChange(updater, currentPaginationState);
    },
    [paginationStrategy, currentPaginationState],
  );

  // Create table instance
  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    ...tableConfig,
    onPaginationChange: handlePaginationChange,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: currentPaginationState,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
  });

  return {
    //return the loading state
    table,
    isLoading,
    setIsLoading,
    tableState: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: currentPaginationState,
    },
  };
}
