"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, TrendingUp, MapPin } from "lucide-react";
import Image from "next/image";

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
}: DogCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const getRescuerBadgeColor = (type: string) => {
    switch (type) {
      case "Shelter":
        return "bg-blue-500/90 text-white hover:bg-blue-600/90";
      case "Veterinary":
        return "bg-green-500/90 text-white hover:bg-green-600/90";
      case "Rescuer":
        return "bg-orange-500/90 text-white hover:bg-orange-600/90";
      default:
        return "bg-gray-500/90 text-white";
    }
  };

  const getProfileUrl = () => {
    const type = rescuedBy.toLowerCase();
    return `/profile/${type}/${rescuerId}`;
  };

  const handleRescuerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(getProfileUrl() as Route);
  };

  const handleCardClick = () => {
    router.push(`/donate/${id}` as Route);
  };

  return (
    <div onClick={handleCardClick} className="block cursor-pointer">
      <Card
        className="group relative overflow-hidden border-white/20 bg-white/20 backdrop-blur-md transition-all duration-300 hover:bg-white/30 hover:shadow-xl hover:scale-[1.02] p-0 cursor-pointer"
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
              <>
                {[...Array(6)].map((_, i) => (
                  <div
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
                  Amount Raised
                </span>
                <span className="font-semibold text-white text-lg">
                  ${(raised || 0).toLocaleString()}
                </span>
              </div>
              {goal && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-white/80">
                    <TrendingUp className="h-4 w-4" />
                    Goal
                  </span>
                  <span className="font-semibold text-white text-lg">${goal.toLocaleString()}</span>
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
    </div>
  );
}
