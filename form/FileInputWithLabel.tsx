"use client";

import { FieldValues, Path, useFormContext } from "react-hook-form";
import { useCallback, useRef } from "react";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { InputHTMLAttributes } from "react";

type Props<S extends FieldValues> = {
  fieldTitle: string;
  nameInSchema: Path<S>;
  required?: boolean;
  className?: string;
  accept?: string;
  maxSize?: number;
  containerClasses?: HTMLDivElement["className"];
  multiple?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "multiple">;

export default function FileInputWithLabel<S extends FieldValues>({
  fieldTitle,
  nameInSchema,
  className,
  required,
  accept = ".jpg,.jpeg,.png,image/jpeg,image/png",
  maxSize = 2 * 1024 * 1024,
  containerClasses,
  multiple = false,
  ...props
}: Props<S>) {
  const form = useFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateFileSize = (files: FileList | File[]): string | null => {
    const fileArray = Array.isArray(files) ? files : Array.from(files);
    for (const file of fileArray) {
      if (file.size > maxSize) {
        return `File "${file.name}" is too large. Maximum size is ${formatFileSize(maxSize)}.`;
      }
    }
    return null;
  };

  const handleFileSelect = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  return (
    <FormField
      control={form.control}
      name={nameInSchema}
      render={({ field }) => {
        const handleFileChange = (
          event: React.ChangeEvent<HTMLInputElement>,
        ) => {
          const files = event.target.files;

          if (files && files.length > 0) {
            const validationError = validateFileSize(files);
            if (validationError) {
              form.setError(nameInSchema, { message: validationError });
              // Clear the input
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
              return;
            }

            // Clear any existing errors
            form.clearErrors(nameInSchema);

            const fileArray = Array.from(files);
            const value = multiple ? fileArray : fileArray[0];
            field.onChange(value);
          } else {
            // Handle file removal/clearing via input
            field.onChange(multiple ? [] : null);
            form.clearErrors(nameInSchema);
          }

          // Trigger validation
          field.onBlur();

          form.trigger(nameInSchema);
        };

        const getCurrentFiles = (): File[] => {
          if (!field.value) return [];
          if (multiple) {
            return Array.isArray(field.value) ? field.value : [];
          } else {
            return field.value && !Array.isArray(field.value)
              ? [field.value as File]
              : [];
          }
        };

        const handleRemoveFile = (indexToRemove?: number) => {
          if (multiple && typeof indexToRemove === "number") {
            const currentFiles = getCurrentFiles();
            const updatedFiles = currentFiles.filter(
              (_, index) => index !== indexToRemove,
            );
            field.onChange(updatedFiles.length > 0 ? updatedFiles : []);
          } else {
            field.onChange(multiple ? [] : null);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }
          form.clearErrors(nameInSchema);
          field.onBlur();
          form.trigger(nameInSchema);
        };

        const currentFiles = getCurrentFiles();
        const hasFiles = currentFiles.length > 0;

        return (
          <FormItem>
            <div
              className={`grid max-w-full items-center gap-1.5 ${containerClasses ?? ""}`}
            >
              <FormLabel className="block leading-5" htmlFor={nameInSchema}>
                {fieldTitle}
                {required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>

              <FormControl>
                <div className="space-y-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileChange}
                    name={field.name}
                    {...props}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFileSelect}
                    className={`hover:border-primary/50 h-12 w-full justify-start border ${className} -mt-2`}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {hasFiles
                      ? `${currentFiles.length} file${currentFiles.length > 1 ? "s" : ""} selected`
                      : `Choose ${multiple ? "files" : "file"}`}
                  </Button>

                  {hasFiles && (
                    <div className="text-muted-foreground max-w-full space-y-1 text-sm">
                      <p className="font-medium">
                        {multiple ? "Selected files:" : "Selected file:"}
                      </p>
                      {currentFiles.map((file, index) => (
                        <div
                          key={`${file.name}-${file.size}-${index}`}
                          className="bg-muted flex items-center justify-between rounded px-2 py-1 text-xs"
                        >
                          <span className="shrink truncate whitespace-normal">
                            {file.name}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground">
                              {formatFileSize(file.size)}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRemoveFile(multiple ? index : undefined)
                              }
                              className="h-6 w-6 p-0"
                            >
                              <X className="text-destructive h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
            </div>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
