# personal-fe-components

A personal library of React/Next.js source components, meant to be **pulled directly into other projects** rather than installed via npm. There's no build step, no package to publish — just source you copy in and wire up.

## How to pull components into a project

### Option A — one-off copy with `degit` (recommended for grabbing a single folder)

```bash
# from the root of the consuming project
npx degit Pherizee/personal-fe-components/data-table components/data-table
npx degit Pherizee/personal-fe-components/form components/form
```

`degit` copies the files with no git history attached, so they land as normal source you can edit freely. Re-run the same command later to pull updates (it will refuse to overwrite by default — pass `--force` if you want to overwrite local edits).

### Option B — git submodule (recommended if you want to track updates over time)

```bash
git submodule add https://github.com/Pherizee/personal-fe-components.git components/personal-fe-components
```

With this approach `data-table/` and `form/` live one level deeper (e.g. `components/personal-fe-components/data-table`). Either update the `@/components/*` alias imports inside the submodule after pulling it in, or add a matching path alias in the consumer's `tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    "paths": {
      "@/components/*": ["./components/personal-fe-components/*", "./components/*"]
    }
  }
}
```

## Prerequisites in the consuming project

These components assume a Next.js **App Router** project with:

- **shadcn/ui** installed at `components/ui/*` — specifically: `card`, `table`, `spinner`, `button`, `input`, `dialog`, `form`, `dropdown-menu`, `popover`, `calendar`, `checkbox`, `textarea`, `command`, `multiple-selector`
- `react-hook-form` + `@hookform/resolvers` + `zod`
- `@tanstack/react-table` (v8) and `@tanstack/react-query`
- `lucide-react`, `sonner`, `@radix-ui/react-dialog`, `date-fns`, `react-day-picker`
- A `@/lib/utils` module exporting `cn`, `copyToClipboard`, `convertToCSV`, `downloadCSV`
- A `@/types/global` module exporting `Pagination` and `PaginatedResponse` types
- A `@/hooks/useDebounce` hook
- A `@/*` path alias resolving to the project root (the Next.js default)

All imports inside this repo use the `@/components/ui/*` / `@/components/form/*` alias form (not relative paths), so as long as the consumer's `@/*` alias resolves correctly and `data-table`/`form` end up somewhere under `@/components/`, everything resolves without edits.

## What's in here

- **`data-table/`** — a generic wrapper (`DataTable`) around TanStack Table v8: sorting, filtering, column visibility, row selection, a pluggable pagination strategy (client-side, server-side, or URL-query-param-driven), a loading overlay, and a CSV export dialog. See `CLAUDE.md` for the internal architecture.
- **`form/`** — `react-hook-form` field wrappers (`InputWithLabel`, `SelectWithLabel`, `CheckboxWithLabel`, `DatePickerWithLabel`, `TextareaWithLabel`, `FileInputWithLabel`, `MultipleSelectWithLabel`) that must be rendered inside a `<Form {...form}>` provider, plus `form/infinite-combobox/` — a TanStack Query–backed combobox that isn't RHF-bound.

For details on how the pieces fit together internally, see [`CLAUDE.md`](./CLAUDE.md).
