import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpdateImageModalProps {
  image: string | null;
  onClose: () => void;
}

export function UpdateImageModal({ image, onClose }: UpdateImageModalProps) {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div className="relative max-h-[90vh] max-w-4xl">
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-4 -top-4 h-10 w-10 rounded-full bg-background"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="relative h-full w-full">
          <Image
            src={image || "/placeholder.svg"}
            alt="Update image"
            width={1200}
            height={800}
            className="h-auto max-h-[90vh] w-auto rounded-lg object-contain"
          />
        </div>
      </div>
    </div>
  );
}
