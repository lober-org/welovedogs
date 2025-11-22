import Image from "next/image";
import type { Update } from "../types";

interface UpdateCardProps {
  update: Update;
  variant?: "desktop" | "mobile";
}

export function UpdateCard({ update, variant = "desktop" }: UpdateCardProps) {
  if (variant === "mobile") {
    return (
      <div className="rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-4 shadow-sm">
        <div className="relative w-full h-40 rounded-lg mb-3 overflow-hidden">
          <Image
            src={update.dogImage || "/placeholder.svg"}
            alt={update.dogName}
            fill
            className="object-cover"
          />
        </div>
        <h4 className="font-sans font-bold text-gray-900 text-lg mb-1">{update.dogName}</h4>
        <span className="text-xs text-gray-600 mb-2 block">{update.date}</span>
        <p className="text-sm leading-relaxed text-gray-700">{update.update}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-4 shadow-sm hover:shadow-md transition-all hover:border-purple-400">
      <div className="flex gap-4">
        <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={update.dogImage || "/placeholder.svg"}
            alt={update.dogName}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <h4 className="font-sans font-bold text-gray-900 text-lg mb-1">{update.dogName}</h4>
          <span className="text-xs text-gray-600 mb-2 block">{update.date}</span>
          <p className="text-sm leading-relaxed text-gray-700">{update.update}</p>
        </div>
      </div>
    </div>
  );
}
