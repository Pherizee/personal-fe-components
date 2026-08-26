import { Input } from "@/components/ui/input";
import { Table } from "@tanstack/react-table";
import useDebounce from "@/hooks/useDebounce";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTableLoading } from "./TableLoadingContext";
import { Search, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TableToolbar = <TData,>({
  title,
  description,
  table,
  searchColumn,
  toolbarExtra,
  exportBtn,
  useQueryParams,
}: {
  title: string;
  description?: string;
  table: Table<TData>;
  searchColumn?: string;
  toolbarExtra?: React.ReactNode;
  exportBtn?: React.ReactNode;
  useQueryParams: boolean;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial search value from URL
  const getInitialSearchValue = useCallback(() => {
    return searchParams.get("SearchText") || "";
  }, [searchParams]);

  const [searchValue, setSearchValue] = useState(getInitialSearchValue);
  const { setIsLoading } = useTableLoading();

  const { debouncedValue: debouncedSearchValue, isDebouncing } = useDebounce(
    searchValue,
    500,
  );

  useEffect(() => {
    if (isDebouncing) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [isDebouncing, setIsLoading]);

  useEffect(() => {
    if (useQueryParams) {
      const params = new URLSearchParams(searchParams.toString());

      if (debouncedSearchValue.trim()) {
        params.set("SearchText", debouncedSearchValue.trim());
      } else {
        params.delete("SearchText");
      }

      if (searchColumn) {
        table.getColumn(searchColumn)?.setFilterValue(debouncedSearchValue);
      }

      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [
    debouncedSearchValue,
    router,
    searchParams,
    useQueryParams,
    searchColumn,
    table,
  ]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (useQueryParams) setSearchValue(value);
    setIsLoading(true);

    if (searchColumn) {
      table.getColumn(searchColumn)?.setFilterValue(value);
    }
  };

  const getCurrentSearchValue = () => {
    if (useQueryParams) {
      return searchValue;
    }
    return (
      (table.getColumn(searchColumn as string)?.getFilterValue() as string) ??
      ""
    );
  };

  return (
    <CardHeader>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-32 space-y-2">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>

        <div className="flex flex-col flex-wrap justify-end gap-2 sm:max-w-md sm:flex-row sm:items-center md:max-w-lg lg:max-w-xl xl:max-w-2xl">
          {toolbarExtra}
          {searchColumn && (
            <div className="relative max-w-sm">
              <Search className="absolute top-4 left-2.5 z-10 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search..."
                value={getCurrentSearchValue()}
                onChange={handleSearchChange}
                className="max-w-sm py-2 pl-8"
              />
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id.replace(/([A-Z])/g, " $1").trim()}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          {exportBtn}
        </div>
      </div>
    </CardHeader>
  );
};

export default TableToolbar;
