import { Column } from "@tanstack/react-table";

const SelectColumnFilter = <T,>({
  column,
  title,
  options,
}: {
  column: Column<T, unknown>;
  title: string;
  options: readonly string[];
}) => {
  const filterValue = column.getFilterValue() as string | undefined;

  return (
    <div className="flex flex-col items-start gap-1">
      <span className="text-sm font-medium">{title}</span>
      <select
        value={filterValue ?? ""}
        onChange={(e) => {
          column.setFilterValue(e.target.value || undefined);
        }}
        onClick={(e) => e.stopPropagation()}
        className="w-full min-w-[120px] rounded border border-gray-300 p-1 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        aria-label={`Filter by ${title}`}
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectColumnFilter;
