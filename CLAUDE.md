# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A personal library of React/Next.js source components meant to be **copied into consuming projects**, not installed as an npm package (same model as shadcn/ui). There is currently no `package.json`, build config, linter, or test runner in this repo — it is pure source, and it is never run or compiled standalone. It only compiles once dropped into a host Next.js (App Router) project that already has the peer pieces listed below.

Because there's no local tooling, there are no build/lint/test commands to run here. Type-checking and linting only make sense in the context of a consumer app after copying files in. See `README.md` for how components get pulled into a consuming project (degit or git submodule) and the full prerequisite list.

## Assumed host environment

Every component assumes it's dropped into a Next.js App Router project with:

- **shadcn/ui** installed at `components/ui/*` (Card, Table, Button, Input, Popover, Command, Calendar, Dialog, Form, Checkbox, Textarea, Spinner, MultipleSelector, etc.)
- **react-hook-form** + **@hookform/resolvers/zod** + **zod**
- **@tanstack/react-table** (v8) and **@tanstack/react-query** (for the infinite combobox)
- **lucide-react**, **sonner** (toast), **@radix-ui/react-dialog**
- A `@/lib/utils` module exporting `cn`, `copyToClipboard`, `convertToCSV`, `downloadCSV`
- A `@/types/global` module exporting `Pagination` and `PaginatedResponse` types
- A `@/hooks/useDebounce` hook

When adding a new component, check whether it depends on one of these consumer-provided modules and keep depending on it by the same name/shape rather than inlining a copy — that's the contract the rest of the library relies on.

## Import path convention

Every file uses the `@/components/ui/*` and `@/components/form/*` path alias to reach shadcn primitives and cross-reference between `data-table/` and `form/` (e.g. `data-table/table-export.tsx` imports `@/components/form/InputWithLabel`). Always use this alias form for new components — never a relative `../ui/...` import — so a component keeps resolving correctly regardless of how deep it ends up nested in a consumer's `components/` tree (this repo is distributed by copy/submodule, not npm install, so components land at varying depths across projects). See `README.md` for the consumer-side alias setup this depends on.

## `data-table/` architecture

`DataTable` (`data-table/datatable.tsx`) is a generic wrapper around TanStack Table v8, composed from:

- **`hooks.ts` → `useDataTableLogic`**: owns all TanStack Table state (`sorting`, `columnFilters`, `columnVisibility`, `rowSelection`, `pagination`) and constructs the `useReactTable` instance. Pagination behavior is delegated to a **strategy object** rather than handled inline.
- **`utils.ts`**: implements the pagination strategy pattern. `PaginationStrategyFactory.create()` picks one of four strategies based on what's passed to `DataTable`'s `pagination`/`useQueryParams` props:
  - `URLPaginationStrategy` — no `pagination` prop, `useQueryParams: true`: reads/writes `PageNumber`/`PageSize` in the URL via `next/navigation`.
  - `NewPaginationStrategy` — `pagination` is the new-style `Pagination` type (`currentPage`/`totalPages`/`pageSize` from `@/types/global`), server-driven, `isManual() === true`.
  - `OldPaginationStrategy` — `pagination` is the legacy `PaginationControl` shape (`pageIndex`/`onPageChange`/`onPageSizeChange` callbacks), also server-driven. Kept for backwards compatibility with older consumers — don't merge it into `NewPaginationStrategy`.
  - `InternalPaginationStrategy` — no `pagination` prop, no query params: fully client-side pagination.
  `PaginationTypeGuards` distinguishes the two prop shapes at runtime since both are structurally plausible. If you add a fifth pagination mode, it belongs here as another `PaginationStrategy` implementation plus a factory branch, not as a conditional inside `hooks.ts`.
- **`TableLoadingContext.tsx`**: a small context (`useTableLoading`) that exposes `isLoading`/`setIsLoading` to descendants (e.g. so a page-change action can flip on a loading overlay before new `data` arrives as props). `DataTable` flips `isLoading` back off in a `useEffect` keyed on `props.data`.
- **`table-toolbar.tsx` / `table-header.tsx` / `table-content.tsx` / `table-pagination.tsx`**: presentational pieces `DataTable` composes; toolbar accepts a `toolbarExtra` prop that can be a node or a `(table) => node` render function for toolbar content that needs access to the live table instance.
- **`table-export.tsx`**: a self-contained export dialog with its own dynamically-built Zod schema — one enum field per key in `fetchingEnums`, plus fixed `pageSize`/`dateFrom`/`dateTo` fields — validated with `react-hook-form` + `zodResolver`. On submit it calls the consumer-supplied `fetchFunction`, and either hands the result to `onExportData` or CSV-exports it itself via `@/lib/utils`. This is the one file in `data-table/` that pulls in `form/` components directly.
- **`select-filter.tsx` / `table-status-filters.tsx` / `cell-with-copy.tsx` / `email-cell-with-copy.tsx` / `phone-cell-with-copy.tsx`**: reusable column/cell/filter helpers meant to be used from a consumer's `ColumnDef[]`, not from inside `DataTable` itself.

## `form/` architecture

Every `*WithLabel` component follows the same shape: a generic `<T extends FieldValues>` component that takes `fieldTitle` (label text) and `nameInSchema: Path<T>` (the RHF field path), calls `useFormContext<T>()` internally, and renders shadcn's `FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormMessage` around the underlying input primitive. This means **every one of these must be rendered inside a `react-hook-form` `<Form {...form}>` (FormProvider)** — they don't accept `control` or `value`/`onChange` directly.

`form/infinite-combobox/` is the exception: it's not RHF-bound. `InfiniteCombobox` takes a TanStack Query `UseInfiniteQueryResult` directly (`infiniteQuery` prop) plus a `transformToOption` mapper, flattens `infiniteQuery.data.pages` into options, and delegates the scroll-to-load-more behavior to `infinite-scroll-list.tsx`. If a component needs this inside an RHF form, that wiring (calling `field.onChange` from `onSelect`) belongs in the consumer, not in this component.

When adding a new form field component, match the existing prop contract (`fieldTitle`, `nameInSchema`, `description`, `className`, plus whatever the underlying shadcn primitive needs spread via `...props`) so `table-export.tsx` and other composed forms can keep using these components interchangeably.
