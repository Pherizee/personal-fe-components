"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTableLoading } from "./TableLoadingContext";

export type StatusLabel = {
  value: string | undefined;
  name: string;
};

interface StatusFilterProps<T extends StatusLabel> {
  statusLabels: T[];
  searchParamKey: string;
  itemTypeName: string;
  defaultStatusName?: string;
  buttonClassName?: string;
}

const StatusFilter = <T extends StatusLabel>({
  statusLabels,
  searchParamKey,
  itemTypeName,
  defaultStatusName = "Approved",
  buttonClassName = "h-8 px-4",
}: StatusFilterProps<T>) => {
  const { setIsLoading } = useTableLoading();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get(searchParamKey);
  const currentStatusObj = statusLabels.find(
    (status) => status.value === currentStatus,
  );

  const handleStatusChange = (statusValue: string | undefined) => {
    setIsLoading(true);
    const params = new URLSearchParams(window.location.search);
    params.delete("PageNumber");
    params.delete("PageSize");
    if (statusValue === undefined) {
      params.delete(searchParamKey);
    } else {
      params.set(searchParamKey, statusValue.toString());
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={buttonClassName}>
            <span>
              {currentStatus
                ? `${currentStatusObj?.name} ${itemTypeName}`
                : `${defaultStatusName} ${itemTypeName}`}
            </span>
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {statusLabels.map((status) => (
            <DropdownMenuItem
              key={status.value}
              onClick={() => handleStatusChange(status.value)}
            >
              {status.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default StatusFilter;
