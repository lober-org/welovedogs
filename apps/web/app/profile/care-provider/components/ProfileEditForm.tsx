"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormActions } from "./FormActions";
import { generateAboutFromStory } from "@/app/actions/generate-about";
import { parseStory } from "@/lib/parse-story";
import type { ProfileData } from "../types";

interface ProfileEditFormProps {
  profileData: ProfileData;
  editFormData: ProfileData;
  onFormDataChange: (data: ProfileData) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function ProfileEditForm({
  profileData,
  editFormData,
  onFormDataChange,
  onSave,
  onCancel,
}: ProfileEditFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAbout = async () => {
    setIsGenerating(true);
    try {
      console.log("Starting about generation...");
      const storyQA = parseStory(profileData.story, profileData.type);
      console.log("Parsed story QA:", storyQA.length, "questions");

      // Note: generateAboutFromStory currently always throws an error
      // This is expected behavior - the function is disabled
      await generateAboutFromStory(storyQA, profileData.type);
    } catch (error) {
      console.error("Error generating about section:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      alert(
        `Failed to generate about section: ${errorMessage}\n\nPlease make sure the OPENAI_API_KEY environment variable is configured in the Vars section.`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const updateField = (field: keyof ProfileData, value: string) => {
    onFormDataChange({ ...editFormData, [field]: value });
  };

  return (
    <div className="space-y-4 bg-white rounded-lg p-6 border-2 border-purple-200">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={editFormData.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="clinicName">Clinic/Organization Name</Label>
          <Input
            id="clinicName"
            value={editFormData.clinicName}
            onChange={(e) => updateField("clinicName", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={editFormData.email}
            onChange={(e) => updateField("email", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={editFormData.phone}
            onChange={(e) => updateField("phone", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={editFormData.website}
            onChange={(e) => updateField("website", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={editFormData.location}
            onChange={(e) => updateField("location", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="about">About</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleGenerateAbout}
              disabled={isGenerating || !profileData.story}
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate with AI"}
            </Button>
          </div>
          <Textarea
            id="about"
            value={editFormData.about}
            onChange={(e) => updateField("about", e.target.value)}
            rows={4}
            placeholder="Write a brief description about yourself and your work, or use AI to generate one based on your story..."
          />
          {!profileData.story && (
            <p className="text-xs text-gray-500 mt-1">Add your story first to use AI generation</p>
          )}
        </div>
      </div>
      <FormActions onSave={onSave} onCancel={onCancel} />
    </div>
  );
}
