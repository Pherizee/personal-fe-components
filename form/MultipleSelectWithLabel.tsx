"use client";

import { FieldValues, Path, useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import MultipleSelector, { Option } from "@/components/ui/multiple-selector";
import { ComponentProps } from "react";

type Props<S extends FieldValues> = {
  fieldTitle: string;
  nameInSchema: Path<S>;
  required?: boolean;
  className?: string;
} & Omit<ComponentProps<typeof MultipleSelector>, "value" | "onChange">;

export function MultipleSelectorWithLabel<S extends FieldValues>({
  fieldTitle,
  nameInSchema,
  required,
  className,
  ...props
}: Props<S>) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={nameInSchema}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel className="text-sm" htmlFor={nameInSchema}>
            {fieldTitle}
            {required && <span className="text-red-500">*</span>}
          </FormLabel>

          <FormControl className="w-full">
            <MultipleSelector
              {...props}
              value={field.value || []}
              onChange={(options: Option[]) => {
                field.onChange(options);
              }}
              className={`min-h-12 w-full ${className || ""}`}
              placeholder="Select options"
            />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
