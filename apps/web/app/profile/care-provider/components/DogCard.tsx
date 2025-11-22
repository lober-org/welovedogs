"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Heart, MapPin, Calendar, ChevronRight } from "lucide-react";
import type { Dog } from "../types";

interface DogCardProps {
  dog: Dog;
}

export function DogCard({ dog }: DogCardProps) {
  return (
    <Link href={`/profile/care-provider/dog/${dog.id}`}>
      <div className="bg-white rounded-lg border-2 border-purple-200 p-4 hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer">
        <div className="flex gap-4">
          <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden">
            <Image
              src={dog.images[0] || "/placeholder.svg"}
              alt={dog.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-800">{dog.name}</h3>
              <div className="flex gap-1">
                {dog.isEmergency && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Emergency
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {dog.currentCondition || dog.story}
            </p>
            <div className="flex flex-wrap gap-2 mb-2">
              {dog.needsSurgery && (
                <Badge variant="outline" className="text-xs">
                  Surgery Needed
                </Badge>
              )}
              {dog.readyForAdoption && (
                <Badge
                  variant="outline"
                  className="text-xs bg-green-50 text-green-700 border-green-300"
                >
                  <Heart className="h-3 w-3 mr-1" />
                  Ready for Adoption
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              {dog.location}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <Calendar className="h-3 w-3" />
              Added {new Date(dog.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-2">
          <ChevronRight className="h-5 w-5 text-purple-600" />
        </div>
      </div>
    </Link>
  );
}
