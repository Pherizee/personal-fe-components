import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Form } from "@/components/ui/form";
import { FieldValues, Path, useForm } from "react-hook-form";
import { SelectWithLabel } from "@/components/form/SelectWithLabel";
import { z, ZodEnum } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputWithLabel } from "@/components/form/InputWithLabel";
import DatePickerWithLabel from "@/components/form/DatePickerWithLabel";
import { convertToCSV, downloadCSV } from "@/lib/utils"; // Assuming these are well-typed
import { toast } from "sonner";

// --- Enhanced Type Definitions ---
export type EnumParamValue = string | number | boolean;

type NonEmptyArray<T> = readonly [T, ...T[]];

export type EnumParameterConfig<TValue extends EnumParamValue> = NonEmptyArray<{
  name: string;
  value: TValue;
}>;

// Each key in TParams maps to a read-only, non-empty array of enum options
export type FetchingEnums<TParams extends Record<string, EnumParamValue>> = {
  readonly [K in keyof TParams]: Readonly<EnumParameterConfig<TParams[K]>>;
};

const fixedSchema = z.object({
  pageSize: z.coerce.number().int().min(0), // Ensure integer, min 0
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});
type FixedParams = z.infer<typeof fixedSchema>;

// Props for the TableExport component
export type TableExportBtnProps<
  TParams extends Record<string, EnumParamValue>,
  TResult,
> = {
  show: boolean | undefined;
  title: string;
  description?: string;
  fetchingEnums: FetchingEnums<TParams>;
  fetchFunction: (params: TParams & FixedParams) => Promise<TResult>;
  dataPropName: string; // Property name in TResult that contains the data array
  onExportData?: (data: TResult) => void; // Callback to handle raw data
};

// Returns a record where keys are from TParams and values are ZodEnums of strings
function buildDynamicEnumSchemaShape<
  TParams extends Record<string, EnumParamValue>,
>(
  fetchingEnums: FetchingEnums<TParams>,
): Record<keyof TParams, ZodEnum<[string, ...string[]]>> {
  const shape = {} as Record<keyof TParams, ZodEnum<[string, ...string[]]>>;
  for (const key in fetchingEnums) {
    const paramKey = key as keyof TParams;
    const enumOptions = fetchingEnums[paramKey]; // Guaranteed NonEmptyArray

    const stringValues = enumOptions.map((item) => String(item.value)) as [
      string,
      ...string[],
    ]; // Cast to Zod's expected non-empty string array
    shape[paramKey] = z.enum(stringValues);
  }
  return shape;
}

const TableExport = <TParams extends Record<string, EnumParamValue>, TResult>({
  show,
  title,
  description,
  fetchingEnums,
  fetchFunction,
  onExportData,
  dataPropName,
}: TableExportBtnProps<TParams, TResult>) => {
  const [isLoading, setIsLoading] = useState(false);

  const dynamicEnumSchemaShape = buildDynamicEnumSchemaShape(fetchingEnums);
  const dynamicSchema = z.object(dynamicEnumSchemaShape);

  const formSchema = fixedSchema.merge(dynamicSchema);

  type FormSchemaType = z.infer<typeof formSchema>;

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    mode: "onBlur", // Validate on blur
  });

  const onSubmit = async (formData: FormSchemaType) => {
    setIsLoading(true);
    try {
      const { pageSize, dateFrom, dateTo, ...dynamicParamsFromForm } = formData;

      // Transform string enum values from form back to their original types
      const typedDynamicParams: Partial<TParams> = {};
      for (const stringKey in dynamicParamsFromForm) {
        const paramKey = stringKey as keyof TParams;
        // Value from form is a string, as per dynamicSchema
        const formValue = dynamicParamsFromForm[
          paramKey as keyof typeof dynamicParamsFromForm
        ] as string;

        if (
          formValue !== undefined &&
          formValue !== "" && // Should be caught by Zod if "" isn't a valid enum value
          fetchingEnums[paramKey]
        ) {
          const enumConfig = fetchingEnums[paramKey]; // NonEmptyArray
          const originalEnumValue = enumConfig.find(
            (item) => String(item.value) === formValue,
          );

          if (originalEnumValue) {
            typedDynamicParams[paramKey] = originalEnumValue.value;
          } else {
            // This case should ideally be prevented by Zod validation if formValue is not in the enum
            console.warn(
              `Form value "${formValue}" for key "${String(
                paramKey,
              )}" not found in original enum values. This might indicate an issue.`,
            );
            // Potentially throw an error or handle as a validation failure upstream
          }
        }
      }

      // Construct the final parameters for the fetchFunction
      const paramsForFetch: TParams & FixedParams = {
        ...(typedDynamicParams as TParams), // Assert after careful construction
        pageSize: pageSize ?? 0,
        dateFrom,
        dateTo,
      };

      const response = await fetchFunction(paramsForFetch);

      if (onExportData) {
        onExportData(response);
        // Assuming onExportData handles its own success notifications
        toast.success("Data processing initiated by custom handler.");
      } else {
        const csvFile = convertToCSV(response, dataPropName); // convertToCSV should expect CSVItem[]
        if (csvFile) {
          downloadCSV(
            csvFile,
            `${title.replace(/\s+/g, "_")}_${new Date().toISOString()}_export.csv`,
          );
          toast.success("CSV export successful and download started!");
        } else {
          toast.error("Failed to generate CSV file from data.");
        }
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Export operation failed: An unknown error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size={"sm"} aria-label={`Export ${title}`}>
          <Download className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              onSubmit as (data: FieldValues) => void,
            )}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Object.entries(fetchingEnums).map(([key, enumConfigUntyped]) => {
                // Cast to ensure correct type for enumConfig
                const enumConfig =
                  enumConfigUntyped as EnumParameterConfig<EnumParamValue>;
                return (
                  <SelectWithLabel<z.infer<typeof dynamicSchema>>
                    required // Assuming all dynamic enums are required
                    key={key}
                    nameInSchema={key as Path<z.infer<typeof dynamicSchema>>}
                    fieldTitle={`Select ${
                      key.charAt(0).toUpperCase() + key.slice(1)
                    }`}
                    data={enumConfig.map((item) => ({
                      // `id` for SelectWithLabel should ideally be string or number
                      id: String(item.value),
                      label: item.name,
                    }))}
                  />
                );
              })}
              <div className="col-span-full sm:col-span-2">
                <InputWithLabel
                  fieldTitle="Page Size (0 for all)"
                  description="Number of records. 0 fetches all available records."
                  nameInSchema="pageSize"
                  type="number"
                  required
                />
              </div>
              <DatePickerWithLabel
                nameInSchema="dateFrom"
                fieldTitle="Date From"
                valueAsDate
              />
              <DatePickerWithLabel
                nameInSchema="dateTo"
                fieldTitle="Date To"
                disabled={false}
                valueAsDate
              />
            </div>

            <Button
              type="submit"
              className="mt-6 w-full px-8 sm:w-auto"
              disabled={isLoading}
              loading={isLoading}
            >
              {isLoading ? "Exporting..." : "Export Data"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TableExport;
