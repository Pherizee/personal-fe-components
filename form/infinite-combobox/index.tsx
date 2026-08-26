import { useState } from "react";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import InfiniteScrollList from "./infinite-scroll-list";
import { PaginatedResponse } from "@/types/global";

export interface Option {
  id: string;
  label: string;
  value: string;
  icon?: string;
  image?: string;
}

export interface Transformable {
  [key: string]: unknown;
}

export type TransformFunction<T extends Transformable> = (item: T) => Option;

interface InfiniteComboboxProps<T extends Transformable> {
  placeholder?: string;
  emptyText?: string;
  onSelect?: (value: string) => void;
  value?: string;
  infiniteQuery: UseInfiniteQueryResult<PaginatedResponse<T>, Error>;
  transformToOption: TransformFunction<T>;
  searchValue?: string;
  onSearchChange?: (search: string) => void;
  disabled?: boolean;
  className?: string;
}

export function InfiniteCombobox<T extends Transformable>({
  placeholder = "Select option...",
  emptyText = "No options found.",
  onSelect,
  value,
  infiniteQuery,
  transformToOption,
  searchValue,
  onSearchChange,
  disabled = false,
  className,
}: InfiniteComboboxProps<T>) {
  const [open, setOpen] = useState(false);

  // Internal state for search if not controlled externally
  const [internalSearch, setInternalSearch] = useState("");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = infiniteQuery;

  const infiniteData = data as
    | InfiniteData<PaginatedResponse<T>, number>
    | undefined;
  const allOptions: Option[] =
    infiniteData?.pages.flatMap((page) => page.data.map(transformToOption)) ??
    [];

  const selectedOption = allOptions.find((option) => option.value === value);

  const handleSelect = (selectedValue: string) => {
    const newValue = selectedValue === value ? "" : selectedValue;
    onSelect?.(newValue);
    setOpen(false);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Determine if using external or internal controlled search state
  const isControlled =
    typeof searchValue === "string" && typeof onSearchChange === "function";
  const currentSearch = isControlled ? searchValue : internalSearch;
  const handleSearchChange = isControlled ? onSearchChange : setInternalSearch;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={`h-12 w-full justify-between rounded-sm ${className || ""}`}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[min(100%,220px)] p-0"
        sideOffset={4}
        avoidCollisions={true}
        align="start"
      >
        <Command>
          <CommandInput
            placeholder="Search options..."
            value={currentSearch}
            onValueChange={handleSearchChange}
            disabled={disabled}
          />
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground ml-2 text-sm">
                  Loading...
                </span>
              </div>
            )}
            {isError && (
              <div className="p-4 text-sm text-red-500">
                {error?.message || "Error loading options"}
              </div>
            )}
            {!isLoading && !isError && allOptions.length === 0 && (
              <CommandEmpty>{emptyText}</CommandEmpty>
            )}
            {allOptions.length > 0 && (
              <CommandGroup>
                <InfiniteScrollList
                  options={allOptions}
                  selectedValue={value}
                  onSelect={handleSelect}
                  onLoadMore={handleLoadMore}
                  hasNextPage={hasNextPage}
                  isFetchingNextPage={isFetchingNextPage}
                />
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
