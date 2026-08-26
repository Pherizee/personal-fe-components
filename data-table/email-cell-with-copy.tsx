import React from "react";
import { Row } from "@tanstack/react-table";
import CellWithCopy from "./cell-with-copy";

const EmailCellWithCopy = <T,>({
  row,
  columnId,
}: {
  row: Row<T>;
  columnId: keyof T & string;
}) => {
  const value = row.getValue(columnId) as string;

  return <CellWithCopy value={value} type="email" />;
};

export default EmailCellWithCopy;
