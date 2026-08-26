import React from "react";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ColumnDef, flexRender, Table } from "@tanstack/react-table";

const TableContent = <TData, TValue>({
  table,
  columns,
}: {
  table: Table<TData>;
  columns: ColumnDef<TData, TValue>[];
}) => {
  return (
    <TableBody>
      {table.getRowModel().rows?.length ? (
        table.getRowModel().rows.map((row) => (
          <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            No results.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
};

export default TableContent;
