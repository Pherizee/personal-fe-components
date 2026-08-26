import React, { useCallback, useEffect } from "react";
import useDataTableLogic from "./hooks";
import TableExport, { EnumParamValue } from "./table-export";
import { DataTableProps } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import TableToolbar from "./table-toolbar";
import { Table } from "@/components/ui/table";
import CustomTableHeader from "./table-header";
import TableContent from "./table-content";
import TablePagination from "./table-pagination";
import { TableLoadingProvider } from "./TableLoadingContext";
import { Spinner } from "@/components/ui/spinner";

export function DataTable<
  TData,
  TValue,
  TEnum extends Record<string, EnumParamValue>,
>(props: DataTableProps<TData, TValue, TEnum>) {
  const {
    title = "",
    description = "",
    searchColumn,
    toolbarExtra,
    exportBtnProps,
    useQueryParams = false,
    columns,
  } = props;

  const { table, isLoading, setIsLoading } = useDataTableLogic(props); // gets isLoading from the hook

  const renderToolbarExtra = useCallback(() => {
    if (typeof toolbarExtra === "function") {
      return toolbarExtra(table);
    }
    return toolbarExtra;
  }, [toolbarExtra, table]);

  const renderExportButton = useCallback(() => {
    return exportBtnProps?.show ? <TableExport {...exportBtnProps} /> : null;
  }, [exportBtnProps]);

  useEffect(() => {
    setIsLoading(false);
  }, [props.data, setIsLoading]); //set is loading to false when the data arrive

  return (
    <TableLoadingProvider value={{ isLoading, setIsLoading }}>
      <Card className="w-full shadow-none">
        <TableToolbar
          useQueryParams={useQueryParams}
          description={description}
          title={title}
          table={table}
          searchColumn={searchColumn}
          toolbarExtra={renderToolbarExtra()}
          exportBtn={renderExportButton()}
        />
        <CardContent>
          <div className="rounded-md border">
            {isLoading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70">
                <Spinner className="h-12 w-12 text-gray-600" />
              </div>
            )}
            <Table>
              <CustomTableHeader table={table} />
              <TableContent table={table} columns={columns} />
            </Table>
          </div>
          <TablePagination table={table} />
        </CardContent>
      </Card>
    </TableLoadingProvider>
  );
}
