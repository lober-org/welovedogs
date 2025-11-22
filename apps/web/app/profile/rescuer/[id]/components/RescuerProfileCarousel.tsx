"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { RescuerLevelBadge } from "./RescuerLevelBadge";
import { RescuerStats } from "./RescuerStats";
import { RescuerReputationBadge } from "./RescuerReputationBadge";
import type { Rescuer } from "../types";

interface RescuerProfileCarouselProps {
  rescuer: Rescuer;
}

export function RescuerProfileCarousel({ rescuer }: RescuerProfileCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    dragFree: false,
    containScroll: "trimSnaps",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative flex flex-col justify-start rounded-lg border-2 border-purple-300 bg-gradient-to-br from-purple-100 via-purple-50 to-white shadow-sm overflow-hidden">
      {/* Carousel Container */}
      <div
        className={`overflow-hidden ${rescuer.story ? "cursor-grab active:cursor-grabbing" : ""}`}
        ref={emblaRef}
      >
        <div className="flex">
          {/* Slide 1: Reputation & Level Section */}
          <div className="flex-[0_0_100%] min-w-0 p-6">
            <div className="mb-6">
              <RescuerLevelBadge level={rescuer.level} reputation={rescuer.reputation} />
              <RescuerStats rescuer={rescuer} />
              <RescuerReputationBadge reputation={rescuer.reputation} />
            </div>
          </div>

          {/* Slide 2: Story Section */}
          {rescuer.story && (
            <div className="flex-[0_0_100%] min-w-0 p-6">
              <div className="flex flex-col h-full justify-center">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Our Story</h3>
                <p className="text-base leading-relaxed text-gray-900 font-medium">
                  {rescuer.story}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dots Indicator */}
      {rescuer.story && (
        <div className="flex justify-center items-center gap-2 pb-4">
          <button
            type="button"
            onClick={() => emblaApi?.scrollTo(0)}
            className={`h-2 rounded-full transition-all ${
              selectedIndex === 0 ? "bg-purple-600 w-6" : "bg-purple-300 w-2"
            }`}
            aria-label="Go to reputation slide"
          />
          <button
            type="button"
            onClick={() => emblaApi?.scrollTo(1)}
            className={`h-2 rounded-full transition-all ${
              selectedIndex === 1 ? "bg-purple-600 w-6" : "bg-purple-300 w-2"
            }`}
            aria-label="Go to story slide"
          />
          <span className="text-xs text-gray-500 ml-2">
            {selectedIndex === 0 ? "Stats" : "Story"}
          </span>
        </div>
      )}
    </div>
  );
}
