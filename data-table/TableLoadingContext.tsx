"use client";

import { createContext, useContext } from "react";

interface TableLoadingContextType {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const TableLoadingContext = createContext<TableLoadingContextType | undefined>(
  undefined,
);

export const TableLoadingProvider = TableLoadingContext.Provider;

export const useTableLoading = () => {
  const context = useContext(TableLoadingContext);
  if (!context) {
    throw new Error("useTableLoading must be used within TableLoadingProvider");
  }
  return context;
};
