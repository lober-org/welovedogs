"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHeader } from "./components/ProfileHeader";
import { WalletConnection } from "./components/WalletConnection";
import { ProfileEditForm } from "./components/ProfileEditForm";
import { AboutSection } from "./components/AboutSection";
import { StatsCards } from "./components/StatsCards";
import { CampaignsTab } from "./components/CampaignsTab";
import { DogsTab } from "./components/DogsTab";
import { StoryTab } from "./components/StoryTab";
import { ProfileDetailsTab } from "./components/ProfileDetailsTab";
import type { ProfileData, Campaign, Dog } from "./types";

export default function CareProviderProfileClient({
  profileData: initialProfileData,
  campaigns: initialCampaigns,
  dogs: initialDogs,
}: {
  profileData: ProfileData;
  campaigns: Campaign[];
  dogs: Dog[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(initialProfileData);
  const [editFormData, setEditFormData] = useState(initialProfileData);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const campaigns = initialCampaigns;
  const dogs = initialDogs;

  const totalReceived = campaigns.reduce((sum, campaign) => sum + campaign.raised, 0);
  const totalSpent = campaigns.reduce((sum, campaign) => sum + campaign.spent, 0);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setEditFormData({ ...editFormData, profilePhoto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setProfileData(editFormData);
    setIsEditing(false);
    setPhotoPreview(null);
  };

  const handleCancel = () => {
    setEditFormData(profileData);
    setIsEditing(false);
    setPhotoPreview(null);
  };

  const handleStoryUpdate = (story: string) => {
    setProfileData({ ...profileData, story });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-50/50 to-white">
      <div className="container mx-auto px-3 py-4 md:px-4 md:py-8">
        <div className="mx-auto max-w-6xl">
          <Card className="mb-6 md:mb-8 overflow-hidden shadow-xl p-0">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-purple-100 via-purple-50 to-white p-6 md:p-8">
                <ProfileHeader
                  profileData={profileData}
                  photoPreview={photoPreview}
                  isEditing={isEditing}
                  onEditClick={() => setIsEditing(true)}
                  onPhotoChange={handlePhotoChange}
                />

                <WalletConnection />

                {isEditing ? (
                  <ProfileEditForm
                    profileData={profileData}
                    editFormData={editFormData}
                    onFormDataChange={setEditFormData}
                    onSave={handleSave}
                    onCancel={handleCancel}
                  />
                ) : (
                  <AboutSection profileData={profileData} />
                )}

                <StatsCards totalReceived={totalReceived} totalSpent={totalSpent} />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="campaigns" className="space-y-4 md:space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="campaigns">My Campaigns</TabsTrigger>
              <TabsTrigger value="dogs">My Dogs</TabsTrigger>
              <TabsTrigger value="story">My Story</TabsTrigger>
              <TabsTrigger value="profile">Profile Details</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns">
              <CampaignsTab campaigns={campaigns} />
            </TabsContent>

            <TabsContent value="dogs">
              <DogsTab dogs={dogs} />
            </TabsContent>

            <TabsContent value="story">
              <StoryTab profileData={profileData} onStoryUpdate={handleStoryUpdate} />
            </TabsContent>

            <TabsContent value="profile">
              <ProfileDetailsTab profileData={profileData} totalReceived={totalReceived} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
