import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  variant?: "desktop" | "mobile";
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  variant = "desktop",
}: PaginationControlsProps) {
  if (variant === "mobile") {
    return (
      <div className="flex flex-col gap-3 border-t pt-4">
        <div className="text-center text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={currentPage === 1}
            className="flex-1 gap-2 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={onNext}
            disabled={currentPage === totalPages}
            className="flex-1 gap-2 bg-transparent"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border-t pt-4">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentPage === 1}
        className="gap-2 bg-transparent"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
      </div>
      <Button
        variant="outline"
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="gap-2 bg-transparent"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
