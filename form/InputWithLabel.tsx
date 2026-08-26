"use client";

import { FieldValues, Path, useFormContext } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input, InputProps } from "@/components/ui/input";

type Props<T extends FieldValues> = {
  fieldTitle: string;
  nameInSchema: Path<T>;
  className?: string;
  description?: string;
  valueAsNumber?: boolean;
} & InputProps;

export function InputWithLabel<T extends FieldValues>({
  fieldTitle,
  nameInSchema,
  className,
  required,
  description,
  valueAsNumber,
  ...props
}: Props<T>) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={nameInSchema}
      render={({ field }) => (
        <FormItem className="flex w-full flex-col justify-start">
          <FormLabel className="text-sm" htmlFor={nameInSchema}>
            {fieldTitle}
            {required && <span className="text-red-500">*</span>}
          </FormLabel>

          {description && <FormDescription>{description}</FormDescription>}

          <FormControl className="w-full">
            <Input
              id={nameInSchema}
              className={`w-full disabled:bg-gray-200 disabled:opacity-75 ${className}`}
              {...props}
              {...field}
              onChange={(e) => {
                if (valueAsNumber) {
                  const value =
                    e.target.value === "" ? "" : Number(e.target.value);
                  field.onChange(value);
                } else {
                  field.onChange(e);
                }
              }}
            />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
