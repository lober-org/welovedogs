"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, TrendingUp, MapPin, Shield } from "lucide-react";
import Image from "next/image";
import {
  getRescuerBadgeColor,
  getRescuerProfileUrl,
  formatCurrencyDisplay,
} from "@/lib/utils/dog-card";

interface DogCardProps {
  id: string | number;
  name: string;
  location: string;
  image: string;
  headline: string;
  raised: number;
  goal?: number;
  rescuedBy: "Shelter" | "Veterinary" | "Rescuer";
  rescuerName: string;
  rescuerId: string | number;
  rescuerImage?: string;
  escrowBalance?: number;
  isLoadingEscrow?: boolean;
  needsSurgery?: boolean;
  medicalTreatment?: boolean;
  medicalRecovery?: boolean;
  readyForAdoption?: boolean;
  requesterType?: string;
  categoryTags?: string[];
  createdAt?: Date;
  country?: string;
  state?: string;
  city?: string;
}

export function DogCard({
  id,
  name,
  location,
  image,
  headline,
  raised,
  goal,
  rescuedBy,
  rescuerName,
  rescuerId,
  rescuerImage,
  escrowBalance,
  isLoadingEscrow = false,
}: DogCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleRescuerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(getRescuerProfileUrl(rescuedBy, rescuerId) as Route);
  };

  const handleCardClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    router.push(`/donate/${id}` as Route);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  const totalRaised = raised + (escrowBalance || 0);
  const hasEscrow = escrowBalance !== undefined && escrowBalance > 0;

  return (
    // biome-ignore lint/a11y/useSemanticElements: <explanation>
    <Card
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className="group relative overflow-hidden border-white/20 bg-white/20 backdrop-blur-md transition-all duration-300 hover:bg-white/30 hover:shadow-xl hover:scale-[1.02] p-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {isHovered && (
            // biome-ignore lint/complexity/noUselessFragments: <explanation>
            <>
              {[...Array(6)].map((_, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  key={i}
                  className="pointer-events-none absolute animate-float-paw text-white/80"
                  style={{
                    left: `${15 + i * 15}%`,
                    bottom: "-20px",
                    animationDelay: `${i * 0.15}s`,
                    fontSize: "24px",
                  }}
                >
                  🐾
                </div>
              ))}
            </>
          )}

          <div
            className={`absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/80 to-primary/60 transition-opacity duration-300 delay-150 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
              <p className="text-balance text-center text-lg font-semibold leading-relaxed text-white md:text-xl">
                {headline}
              </p>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="px-6 pb-6 pt-3">
        <div className="mb-4">
          <h3 className="mb-1 font-sans text-2xl font-bold text-white">{name}</h3>
          <div className="mb-2 flex items-center gap-1 text-sm text-white/80">
            <MapPin className="h-3.5 w-3.5" />
            <span>{location}</span>
          </div>

          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm text-white/80">Rescued By:</span>
            {/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
            {/** biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            <div
              onClick={handleRescuerClick}
              className="flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
            >
              {rescuerImage && (
                <div className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-white/30">
                  <Image
                    src={rescuerImage || "/placeholder.svg"}
                    alt={rescuerName}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <Badge
                className={`${getRescuerBadgeColor(rescuedBy)} cursor-pointer border-0 px-2 py-0.5 text-xs transition-all hover:shadow-lg`}
              >
                {rescuerName}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-white/80">
                <TrendingUp className="h-4 w-4" />
                Total Raised
              </span>
              <span className="font-semibold text-white text-lg">
                {formatCurrencyDisplay(totalRaised)}
              </span>
            </div>
            {hasEscrow && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-white/70 text-xs">
                  <Shield className="h-3 w-3" />
                  Escrow
                </span>
                <span className="font-medium text-white/90 text-sm">
                  {isLoadingEscrow ? "..." : formatCurrencyDisplay(escrowBalance || 0)}
                </span>
              </div>
            )}
            {raised > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-white/70 text-xs">
                  <TrendingUp className="h-3 w-3" />
                  Instant
                </span>
                <span className="font-medium text-white/90 text-sm">
                  {formatCurrencyDisplay(raised)}
                </span>
              </div>
            )}
            {goal && (
              <div className="flex items-center justify-between text-sm border-t border-white/20 pt-2 mt-1">
                <span className="flex items-center gap-1 text-white/80">
                  <TrendingUp className="h-4 w-4" />
                  Goal
                </span>
                <span className="font-semibold text-white text-lg">
                  {formatCurrencyDisplay(goal)}
                </span>
              </div>
            )}
          </div>
        </div>

        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 pointer-events-none">
          <Heart className="mr-2 h-4 w-4" />
          Donate Now
        </Button>
      </CardContent>
    </Card>
  );
}
