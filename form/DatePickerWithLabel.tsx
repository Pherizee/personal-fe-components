import React from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FieldValues, Path, useFormContext } from "react-hook-form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { DayPicker } from "react-day-picker";

type Props<T extends FieldValues> = {
  fieldTitle: string;
  nameInSchema: Path<T>;
  fieldDescription?: string;
  valueAsDate?: boolean;
  required?: boolean;
} & Omit<React.ComponentProps<typeof DayPicker>, "select">;

const DatePickerWithLabel = <T extends FieldValues>({
  fieldTitle,
  nameInSchema,
  fieldDescription,
  valueAsDate = false,
  required,
  ...props
}: Props<T>) => {
  const form = useFormContext();
  const [open, setOpen] = React.useState(false);

  return (
    <FormField
      control={form.control}
      name={nameInSchema}
      render={({ field }) => {
        const handleChange = (date: Date | undefined) => {
          if (valueAsDate) {
            field.onChange(date);
          } else if (date) {
            field.onChange(format(date, "yyyy-MM-dd"));
          } else {
            field.onChange("");
          }
          setOpen(false); // Close popover after selection
          field.onBlur(); // Trigger onBlur after selection
        };

        const getSelectedDate = (): Date | undefined => {
          if (!field.value) return undefined;

          if (valueAsDate) {
            return typeof field.value === "object" ? field.value : undefined;
          } else {
            try {
              return new Date(field.value);
            } catch {
              return undefined;
            }
          }
        };

        const getDisplayValue = (): string => {
          const date = getSelectedDate();
          if (!date || isNaN(date.getTime())) return "Pick a date";

          try {
            return format(date, "PPP");
          } catch {
            return "Pick a date";
          }
        };

        return (
          <FormItem className="flex flex-col gap-y-2">
            <FormLabel className="mb-0" htmlFor={nameInSchema}>
              {fieldTitle}
              {required && <span className="text-red-500">*</span>}
            </FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    id={nameInSchema}
                    name={field.name}
                    ref={field.ref}
                    variant={"outline"}
                    className={cn(
                      "h-12 w-full py-2 pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground",
                    )}
                    onBlur={field.onBlur}
                    type="button"
                  >
                    {field.value ? getDisplayValue() : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  {...props}
                  mode={"single"}
                  selected={getSelectedDate()}
                  onSelect={handleChange}
                  captionLayout="dropdown"
                  disabled={
                    props.disabled !== undefined
                      ? props.disabled
                      : (date) =>
                          date > new Date() || date < new Date("1900-01-01")
                  }
                />
              </PopoverContent>
            </Popover>
            {fieldDescription && (
              <FormDescription>{fieldDescription}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default DatePickerWithLabel;
