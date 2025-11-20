import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Update } from "./types";

interface UpdateDialogProps {
  update: Update | null;
  onClose: () => void;
}

export function UpdateDialog({ update, onClose }: UpdateDialogProps) {
  if (!update) return null;

  return (
    <Dialog open={!!update} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{update.title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{update.date}</p>
        </DialogHeader>
        <div className="space-y-4">
          {update.image && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={update.image || "/placeholder.svg"}
                alt={update.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <p className="text-base leading-relaxed text-foreground/90">{update.description}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
