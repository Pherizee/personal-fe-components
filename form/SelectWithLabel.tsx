"use client";

import { FieldValues, Path, useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectTriggerProps,
  SelectValue,
} from "@/components/ui/select";

type DataObj = {
  id: number | string;
  label: string;
};

type Props<T extends FieldValues> = {
  fieldTitle: string;
  nameInSchema: Path<T>;
  data: DataObj[];
  className?: string;
  required?: boolean;
  valueAsNumber?: boolean;
  placeholder?: string;
} & SelectTriggerProps;

export function SelectWithLabel<S extends FieldValues>({
  fieldTitle,
  nameInSchema,
  data,
  className,
  required,
  valueAsNumber,
  placeholder = "Select",
  ...props
}: Props<S>) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={nameInSchema}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm" htmlFor={nameInSchema}>
            {fieldTitle}
            {required && <span className="text-red-500">*</span>}
          </FormLabel>

          <Select
            value={
              field.value !== null && field.value !== undefined
                ? String(field.value)
                : ""
            }
            onValueChange={(value) => {
              const processedValue = valueAsNumber
                ? value === ""
                  ? ""
                  : Number(value)
                : value;
              field.onChange(processedValue);
            }}
            onOpenChange={(open) => {
              // Trigger onBlur when select closes
              if (!open) {
                field.onBlur();
              }
            }}
            name={field.name}
          >
            <FormControl>
              <SelectTrigger
                id={nameInSchema}
                className={`w-full ${className || ""}`}
                {...props}
                ref={field.ref}
                onBlur={field.onBlur}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>

            <SelectContent>
              {data.map((item) => (
                <SelectItem
                  key={`${nameInSchema}_${item.id}`}
                  value={item.id.toString()}
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
