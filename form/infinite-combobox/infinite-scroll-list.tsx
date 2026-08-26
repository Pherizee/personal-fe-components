import { useEffect, useRef } from "react";
import { Check, Loader2 } from "lucide-react";
import { CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Option } from ".";

interface InfiniteScrollListProps {
  options: Option[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  onLoadMore: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
}

function InfiniteScrollList({
  options,
  selectedValue,
  onSelect,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
}: InfiniteScrollListProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  return (
    <>
      {options.map((option) => (
        <CommandItem
          key={option.id}
          value={option.value}
          className="cursor-pointer"
          onSelect={() => onSelect(option.value)}
        >
          <Check
            className={cn(
              "mr-2 h-4 w-4",
              selectedValue === option.value ? "opacity-100" : "opacity-0",
            )}
          />
          {option.label}
        </CommandItem>
      ))}

      {/* Intersection observer target */}
      <div ref={loadMoreRef} className="h-1" />

      {/* Loading indicator */}
      {isFetchingNextPage && (
        <div className="flex items-center justify-center p-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-muted-foreground ml-2 text-sm">
            Loading more...
          </span>
        </div>
      )}
    </>
  );
}

export default InfiniteScrollList;
