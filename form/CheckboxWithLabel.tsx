"use client";

import { FieldValues, Path, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

type Props<S extends FieldValues> = {
  nameInSchema: Path<S>; // Ensure it's a string for RHF
  fieldTitle: string;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void; // Explicitly typed for clarity
  className?: string;
  valueType?: "boolean" | "number"; // Restrict to these values
};

export function CheckboxWithLabel<T extends FieldValues>({
  nameInSchema,
  fieldTitle,
  disabled = false,
  onCheckedChange,
  className = "",
  valueType = "boolean",
}: Props<T>) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={nameInSchema}
      render={({ field }) => {
        const isChecked =
          valueType === "number"
            ? field.value === 1 // Explicitly check for 1
            : !!field.value; // Coerce to boolean

        return (
          <FormItem className={`space-x-2 ${className}`}>
            <div className="flex items-center gap-x-2">
              <FormControl>
                <Checkbox
                  id={nameInSchema}
                  checked={typeof isChecked === "boolean" ? isChecked : false} // Add type guard for safety
                  onCheckedChange={(checked) => {
                    if (typeof checked !== "boolean") return;

                    const newValue =
                      valueType === "number" ? (checked ? 1 : 0) : checked;

                    field.onChange(newValue);
                    field.onBlur();

                    if (onCheckedChange) {
                      onCheckedChange(checked);
                    }
                  }}
                  disabled={disabled}
                />
              </FormControl>
              <label
                htmlFor={nameInSchema}
                className="cursor-pointer text-sm leading-none font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {fieldTitle}
              </label>
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
