import { Copy } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";

interface CellWithCopyProps {
  value: string;
  type: "email" | "phone";
  successMessage?: string;
}

const CellWithCopy = ({ value, type, successMessage }: CellWithCopyProps) => {
  const href = type === "email" ? `mailto:${value}` : `tel:${value}`;
  const defaultMessage =
    type === "email" ? "Mail copied" : "Phone number copied";

  const handleCopy = async () => {
    const success = await copyToClipboard(value);
    if (success) {
      toast.success(successMessage || defaultMessage);
    } else {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="flex items-center gap-1">
      <a
        href={href}
        className="lowercase underline hover:text-blue-800 hover:no-underline"
        style={{
          maxWidth: type === "email" ? "180px" : undefined,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          display: "inline-block",
          verticalAlign: "middle",
        }}
        title={value}
      >
        {value}
      </a>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={handleCopy}
        className="h-8 w-8 p-1"
        aria-label={`Copy ${type}`}
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CellWithCopy;
