"use client";

import Image from "next/image";
import { Star, MapPin, Camera, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProfileData } from "../types";

interface ProfileHeaderProps {
  profileData: ProfileData;
  photoPreview: string | null;
  isEditing: boolean;
  onEditClick: () => void;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileHeader({
  profileData,
  photoPreview,
  isEditing,
  onEditClick,
  onPhotoChange,
}: ProfileHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
      <div className="relative">
        <div className="h-24 w-24 md:h-32 md:w-32 rounded-full overflow-hidden bg-purple-100 flex items-center justify-center border-4 border-white shadow-lg">
          {photoPreview || profileData.profilePhoto ? (
            <Image
              src={photoPreview || profileData.profilePhoto || "/placeholder.svg"}
              alt={profileData.name}
              fill
              className="object-cover"
            />
          ) : (
            <Camera className="h-12 w-12 text-purple-400" />
          )}
        </div>
        {isEditing && (
          <label className="absolute bottom-0 right-0 cursor-pointer">
            <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center hover:bg-purple-700 shadow-lg">
              <Camera className="h-4 w-4 text-white" />
            </div>
            <input type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />
          </label>
        )}
      </div>

      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
              {profileData.name}
            </h1>
            {profileData.clinicName && (
              <p className="text-base md:text-lg text-purple-600 font-semibold">
                {profileData.clinicName}
              </p>
            )}
          </div>
          {!isEditing && (
            <Button onClick={onEditClick} variant="outline" size="sm">
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
          {profileData.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-purple-600" />
              <span>{profileData.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{profileData.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-purple-600">{profileData.dogsHelped}</span>
            <span>dogs helped</span>
          </div>
        </div>
      </div>
    </div>
  );
}
