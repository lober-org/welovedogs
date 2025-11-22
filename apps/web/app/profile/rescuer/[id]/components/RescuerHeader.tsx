import { Star } from "lucide-react";
import { SocialMediaIcons } from "./SocialMediaIcons";
import type { Rescuer } from "../types";

interface RescuerHeaderProps {
  rescuer: Rescuer;
}

export function RescuerHeader({ rescuer }: RescuerHeaderProps) {
  return (
    <div className="mb-6">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <h1 className="font-sans text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
          {rescuer.fullName}
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.floor(rescuer.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : star - 0.5 <= rescuer.rating
                      ? "fill-yellow-400/50 text-yellow-400"
                      : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-base font-semibold text-gray-900">{rescuer.rating.toFixed(1)}</span>
        </div>
        <SocialMediaIcons socialMedia={rescuer.socialMedia} />
      </div>
      <p className="text-sm text-gray-600 md:text-base">
        {rescuer.city}, {rescuer.country}
      </p>
    </div>
  );
}
