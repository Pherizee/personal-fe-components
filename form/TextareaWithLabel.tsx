"use client";

import React, { type ComponentProps } from "react";
import { FieldValues, Path, useFormContext } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type TextareaComponentProps = ComponentProps<typeof Textarea>;

type Props<T extends FieldValues> = {
  fieldTitle: string;
  nameInSchema: Path<T>;
  className?: string;
  containerStyles?: string;
  description?: string;
  required?: boolean;
  /** from your CVA variants */
  variant?: TextareaComponentProps["variant"];
} & Omit<
  TextareaComponentProps,
  "id" | "className" | "value" | "onChange" | "required"
>;

export function TextareaWithLabel<T extends FieldValues>({
  fieldTitle,
  nameInSchema,
  className,
  description,
  containerStyles,
  required = false,
  variant = "default",
  ...props
}: Props<T>) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={nameInSchema}
      render={({ field }) => (
        <FormItem className={cn("w-full", containerStyles)}>
          <FormLabel htmlFor={nameInSchema} className="text-sm">
            {fieldTitle}
            {required && <span className="text-red-500">*</span>}
          </FormLabel>

          {description && <FormDescription>{description}</FormDescription>}

          <FormControl className="w-full">
            <Textarea
              id={nameInSchema}
              variant={variant}
              className={className}
              required={required}
              {...props}
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
