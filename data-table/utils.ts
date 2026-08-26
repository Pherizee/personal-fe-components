import { useRouter, useSearchParams } from "next/navigation";
import { type PaginationState, type Updater } from "@tanstack/react-table";
import { Pagination } from "@/types/global";
import { PaginationControl, PaginationStrategy } from "./types";

// ========================
// PAGINATION TYPE GUARDS
// ========================

export class PaginationTypeGuards {
  static isNewPaginationType(
    pagination: PaginationControl | Pagination | undefined,
  ): pagination is Pagination {
    return !!(
      pagination &&
      "currentPage" in pagination &&
      "totalCount" in pagination
    );
  }

  static isOldPaginationType(
    pagination: PaginationControl | Pagination | undefined,
  ): pagination is PaginationControl {
    return !!(
      pagination &&
      "pageIndex" in pagination &&
      "onPageChange" in pagination
    );
  }
}

// ========================
// URL PARAMETER MANAGER
// ========================

export class URLParameterManager {
  constructor(
    private router: ReturnType<typeof useRouter>,
    private searchParams: ReturnType<typeof useSearchParams>,
    private useQueryParams: boolean,
  ) {}

  getInitialPagination(): PaginationState {
    if (!this.useQueryParams) {
      return { pageIndex: 0, pageSize: 10 };
    }

    const pageNumber = parseInt(this.searchParams.get("PageNumber") || "1");
    const pageSize = parseInt(this.searchParams.get("PageSize") || "10");

    return {
      pageIndex: Math.max(0, pageNumber - 1),
      pageSize: Math.max(1, pageSize),
    };
  }

  updateParams(updates: { PageSize?: number; PageNumber?: number }): void {
    if (!this.useQueryParams) return;

    const params = new URLSearchParams(this.searchParams.toString());

    if (updates.PageSize !== undefined) {
      params.set("PageSize", updates.PageSize.toString());
    }

    if (updates.PageNumber !== undefined) {
      params.set("PageNumber", updates.PageNumber.toString());
    }

    this.router.push(`?${params.toString()}`, { scroll: false });
  }
}

// ========================
// PAGINATION STRATEGIES
// ========================

export class URLPaginationStrategy implements PaginationStrategy {
  constructor(
    private urlManager: URLParameterManager,
    private setState: React.Dispatch<React.SetStateAction<PaginationState>>,
  ) {}

  getInitialState(): PaginationState {
    return this.urlManager.getInitialPagination();
  }

  handleChange(
    updater: Updater<PaginationState>,
    currentState: PaginationState,
  ): void {
    const newState =
      typeof updater === "function" ? updater(currentState) : updater;
    this.setState(newState);

    const currentPageNumber = currentState.pageIndex + 1;
    const newPageNumber = newState.pageIndex + 1;

    const updates: { PageSize?: number; PageNumber?: number } = {};

    if (newState.pageSize !== currentState.pageSize) {
      updates.PageSize = newState.pageSize;
      updates.PageNumber = 1;
    } else if (newPageNumber !== currentPageNumber) {
      updates.PageNumber = newPageNumber;
    }

    if (Object.keys(updates).length > 0) {
      this.urlManager.updateParams(updates);
    }
  }

  getPageCount(): number | undefined {
    return undefined;
  }

  isManual(): boolean {
    return false;
  }
}

export class NewPaginationStrategy implements PaginationStrategy {
  constructor(
    private pagination: Pagination,
    private urlManager: URLParameterManager,
  ) {}

  getInitialState(): PaginationState {
    return {
      pageIndex: this.pagination.currentPage - 1,
      pageSize: this.pagination.pageSize,
    };
  }

  handleChange(
    updater: Updater<PaginationState>,
    currentState: PaginationState,
  ): void {
    const newState =
      typeof updater === "function" ? updater(currentState) : updater;
    const newPageNumber = newState.pageIndex + 1;

    if (newPageNumber !== this.pagination.currentPage) {
      this.urlManager.updateParams({ PageNumber: newPageNumber });
    }
    if (newState.pageSize !== this.pagination.pageSize) {
      this.urlManager.updateParams({
        PageSize: newState.pageSize,
        PageNumber: 1,
      });
    }
  }

  getPageCount(): number {
    return this.pagination.totalPages;
  }

  isManual(): boolean {
    return true;
  }
}

export class OldPaginationStrategy implements PaginationStrategy {
  constructor(private pagination: PaginationControl) {}

  getInitialState(): PaginationState {
    return {
      pageIndex: this.pagination.pageIndex,
      pageSize: this.pagination.pageSize,
    };
  }

  handleChange(
    updater: Updater<PaginationState>,
    currentState: PaginationState,
  ): void {
    const newState =
      typeof updater === "function" ? updater(currentState) : updater;

    if (newState.pageIndex !== this.pagination.pageIndex) {
      this.pagination.onPageChange(newState.pageIndex);
    }
    if (newState.pageSize !== this.pagination.pageSize) {
      this.pagination.onPageSizeChange(newState.pageSize);
    }
  }

  getPageCount(): number {
    return Math.ceil(this.pagination.total / this.pagination.pageSize);
  }

  isManual(): boolean {
    return true;
  }
}

export class InternalPaginationStrategy implements PaginationStrategy {
  constructor(
    private setState: React.Dispatch<React.SetStateAction<PaginationState>>,
  ) {}

  getInitialState(): PaginationState {
    return { pageIndex: 0, pageSize: 10 };
  }

  handleChange(
    updater: Updater<PaginationState>,
    currentState: PaginationState,
  ): void {
    const newState =
      typeof updater === "function" ? updater(currentState) : updater;
    this.setState(newState);
  }

  getPageCount(): number | undefined {
    return undefined;
  }

  isManual(): boolean {
    return false;
  }
}

// ========================
// PAGINATION STRATEGY FACTORY
// ========================

export class PaginationStrategyFactory {
  static create(
    pagination: PaginationControl | Pagination | undefined,
    useQueryParams: boolean,
    urlManager: URLParameterManager,
    setState: React.Dispatch<React.SetStateAction<PaginationState>>,
  ): PaginationStrategy {
    if (useQueryParams && !pagination) {
      return new URLPaginationStrategy(urlManager, setState);
    }

    if (PaginationTypeGuards.isNewPaginationType(pagination)) {
      return new NewPaginationStrategy(pagination, urlManager);
    }

    if (PaginationTypeGuards.isOldPaginationType(pagination)) {
      return new OldPaginationStrategy(pagination);
    }

    return new InternalPaginationStrategy(setState);
  }
}

// ========================
// TABLE STATE MANAGER
// ========================

export class TableStateManager {
  constructor(private strategy: PaginationStrategy) {}

  getPaginationState(): PaginationState {
    return this.strategy.getInitialState();
  }

  handlePaginationChange = (
    updater: Updater<PaginationState>,
    currentState: PaginationState,
  ) => {
    this.strategy.handleChange(updater, currentState);
  };

  getTableConfig() {
    return {
      manualPagination: this.strategy.isManual(),
      pageCount: this.strategy.getPageCount(),
    };
  }
}
