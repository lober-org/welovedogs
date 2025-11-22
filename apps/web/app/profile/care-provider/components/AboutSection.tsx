"use client";

import { Mail, Phone, Globe, Instagram } from "lucide-react";
import type { ProfileData } from "../types";

interface AboutSectionProps {
  profileData: ProfileData;
}

export function AboutSection({ profileData }: AboutSectionProps) {
  return (
    <div className="bg-white rounded-lg border-2 border-purple-200 p-6 mt-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">About</h3>
      <p className="text-gray-600 mb-4">{profileData.about || "No about section provided."}</p>

      <div className="grid gap-3 sm:grid-cols-2 text-sm">
        {profileData.email && (
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="h-4 w-4 text-purple-600" />
            <span>{profileData.email}</span>
          </div>
        )}
        {profileData.phone && (
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="h-4 w-4 text-purple-600" />
            <span>{profileData.phone}</span>
          </div>
        )}
        {profileData.website && (
          <div className="flex items-center gap-2 text-gray-600">
            <Globe className="h-4 w-4 text-purple-600" />
            <a
              href={profileData.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline"
            >
              Website
            </a>
          </div>
        )}
        {profileData.instagram && (
          <div className="flex items-center gap-2 text-gray-600">
            <Instagram className="h-4 w-4 text-purple-600" />
            <a
              href={`https://instagram.com/${profileData.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline"
            >
              @{profileData.instagram}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
