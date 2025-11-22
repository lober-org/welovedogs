"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { ProfileData } from "../types";

interface ProfileDetailsTabProps {
  profileData: ProfileData;
  totalReceived: number;
}

export function ProfileDetailsTab({ profileData, totalReceived }: ProfileDetailsTabProps) {
  return (
    <Card className="shadow-xl">
      <CardContent className="p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Profile Information</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="text-base font-semibold text-gray-800">{profileData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone</p>
                <p className="text-base font-semibold text-gray-800">{profileData.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Location</p>
                <p className="text-base font-semibold text-gray-800">{profileData.location}</p>
              </div>
              {profileData.website && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Website</p>
                  <a
                    href={profileData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-semibold text-purple-600 hover:underline"
                  >
                    {profileData.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Statistics</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Dogs Helped</p>
                <p className="text-2xl font-bold text-purple-600">{profileData.dogsHelped}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Received</p>
                <p className="text-2xl font-bold text-green-600">
                  ${totalReceived.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Rating</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {profileData.rating.toFixed(1)} ⭐
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
