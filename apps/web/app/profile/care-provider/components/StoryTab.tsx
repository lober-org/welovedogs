"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit2 } from "lucide-react";
import { parseStory } from "@/lib/parse-story";
import { StoryQuestionCard } from "./StoryQuestionCard";
import { FormActions } from "./FormActions";
import type { ProfileData } from "../types";

interface StoryTabProps {
  profileData: ProfileData;
  onStoryUpdate: (story: string) => void;
}

export function StoryTab({ profileData, onStoryUpdate }: StoryTabProps) {
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [storyAnswers, setStoryAnswers] = useState<string[]>(() => {
    const parsedStory = parseStory(profileData.story, profileData.type);
    return parsedStory.map((qa) => qa.answer);
  });

  const storyQA = parseStory(profileData.story, profileData.type);

  const handleSaveStory = () => {
    const newStory = storyAnswers.join("\n\n");
    onStoryUpdate(newStory);
    setIsEditingStory(false);
    // TODO: Save to database
  };

  const handleCancelStory = () => {
    const parsedStory = parseStory(profileData.story, profileData.type);
    setStoryAnswers(parsedStory.map((qa) => qa.answer));
    setIsEditingStory(false);
  };

  return (
    <Card className="shadow-xl">
      <CardContent className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">My Story</h2>
          {!isEditingStory && (
            <Button onClick={() => setIsEditingStory(true)} variant="outline" size="sm">
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Story
            </Button>
          )}
        </div>

        {isEditingStory ? (
          <div className="space-y-6">
            {storyQA.map((qa, index) => (
              <div key={index} className="space-y-2">
                <Label className="text-base font-semibold text-gray-800">
                  {index + 1}. {qa.question}
                </Label>
                <Textarea
                  value={storyAnswers[index] || ""}
                  onChange={(e) => {
                    const newAnswers = [...storyAnswers];
                    newAnswers[index] = e.target.value;
                    setStoryAnswers(newAnswers);
                  }}
                  rows={4}
                  className="resize-none"
                  placeholder="Share your thoughts..."
                />
              </div>
            ))}

            <div className="pt-4 border-t">
              <FormActions
                onSave={handleSaveStory}
                onCancel={handleCancelStory}
                saveLabel="Save Story"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {storyQA.length > 0 ? (
              storyQA.map((qa, index) => (
                <StoryQuestionCard
                  key={index}
                  question={qa.question}
                  answer={qa.answer}
                  index={index}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No story added yet.</p>
                <Button
                  onClick={() => setIsEditingStory(true)}
                  className="mt-4 bg-purple-600 hover:bg-purple-700"
                >
                  Add Your Story
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
