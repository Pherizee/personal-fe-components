import { Pagination } from "@/types/global";
import {
  ColumnDef,
  PaginationState,
  Updater,
  type Table as TableType,
} from "@tanstack/react-table";
import { EnumParamValue, TableExportBtnProps } from "./table-export";

export interface PaginationControl {
  pageIndex: number;
  pageSize: number;
  total: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
}

export interface DataTableProps<
  TData,
  TValue,
  TEnum extends Record<string, EnumParamValue>,
> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination?: PaginationControl | Pagination;
  searchColumn?: string;
  title?: string;
  description?: string;
  toolbarExtra?:
    | React.ReactNode
    | ((table: TableType<TData>) => React.ReactNode);
  exportBtnProps?: TableExportBtnProps<TEnum, TValue>;
  useQueryParams?: boolean;
}

export interface PaginationStrategy {
  getInitialState(): PaginationState;
  handleChange(
    updater: Updater<PaginationState>,
    currentState: PaginationState,
  ): void;
  getPageCount(): number | undefined;
  isManual(): boolean;
}
