"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, ArrowLeft, Trash2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { createBrowserClient } from "@/lib/supabase/client";

interface Dog {
  id: string;
  name: string;
  images: string[];
  story: string;
  current_condition: string;
  location: string;
  city: string;
  state: string;
  country: string;
  headline: string;
  is_emergency: boolean;
  emergency_explanation: string;
  needs_surgery: boolean;
  medical_treatment: string;
  medical_recovery: string;
  ready_for_adoption: boolean;
  created_at: string;
}

export default function DogEditClient({ dog: initialDog }: { dog: Dog }) {
  const router = useRouter();
  const [dog, setDog] = useState(initialDog);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from("dogs")
      .update({
        name: dog.name,
        story: dog.story,
        current_condition: dog.current_condition,
        location: dog.location,
        city: dog.city,
        state: dog.state,
        country: dog.country,
        headline: dog.headline,
        is_emergency: dog.is_emergency,
        emergency_explanation: dog.emergency_explanation,
        needs_surgery: dog.needs_surgery,
        medical_treatment: dog.medical_treatment,
        medical_recovery: dog.medical_recovery,
        ready_for_adoption: dog.ready_for_adoption,
      })
      .eq("id", dog.id);

    if (error) {
      console.error(" Error updating dog:", error);
      alert("Failed to update dog information");
    } else {
      router.push("/profile/care-provider");
      router.refresh();
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ${dog.name}'s profile? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    const supabase = createBrowserClient();

    const { error } = await supabase.from("dogs").delete().eq("id", dog.id);

    if (error) {
      console.error(" Error deleting dog:", error);
      alert("Failed to delete dog profile");
      setIsDeleting(false);
    } else {
      router.push("/profile/care-provider");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-50/50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        <Card className="shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Edit Dog Profile</h1>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Dog Images */}
              <div>
                <Label>Dog Images</Label>
                <div className="flex gap-2 mt-2">
                  {dog.images.map((image, index) => (
                    <div
                      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                      key={index}
                      className="relative h-24 w-24 rounded-lg overflow-hidden border"
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${dog.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Dog Name *</Label>
                  <Input
                    id="name"
                    value={dog.name}
                    onChange={(e) => setDog({ ...dog, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="headline">Headline *</Label>
                  <Input
                    id="headline"
                    value={dog.headline}
                    onChange={(e) => setDog({ ...dog, headline: e.target.value })}
                    placeholder="e.g., Help Max recover from surgery"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={dog.city}
                    onChange={(e) => setDog({ ...dog, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={dog.state}
                    onChange={(e) => setDog({ ...dog, state: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={dog.country}
                    onChange={(e) => setDog({ ...dog, country: e.target.value })}
                  />
                </div>
              </div>

              {/* Story */}
              <div>
                <Label htmlFor="story">Dog's Story *</Label>
                <Textarea
                  id="story"
                  value={dog.story}
                  onChange={(e) => setDog({ ...dog, story: e.target.value })}
                  rows={6}
                  placeholder="Share this dog's story..."
                />
              </div>

              {/* Current Condition */}
              <div>
                <Label htmlFor="current_condition">About</Label>
                <Textarea
                  id="current_condition"
                  value={dog.current_condition}
                  onChange={(e) => setDog({ ...dog, current_condition: e.target.value })}
                  rows={4}
                  placeholder="Describe the dog's current medical condition..."
                />
              </div>

              {/* Medical Information */}
              <div className="space-y-4 bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg">Medical Information</h3>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="needs_surgery"
                    checked={dog.needs_surgery}
                    onChange={(e) => setDog({ ...dog, needs_surgery: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="needs_surgery" className="cursor-pointer">
                    Needs Surgery
                  </Label>
                </div>

                <div>
                  <Label htmlFor="medical_treatment">Medical Treatment Needed</Label>
                  <Textarea
                    id="medical_treatment"
                    value={dog.medical_treatment}
                    onChange={(e) => setDog({ ...dog, medical_treatment: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="medical_recovery">Recovery Plan</Label>
                  <Textarea
                    id="medical_recovery"
                    value={dog.medical_recovery}
                    onChange={(e) => setDog({ ...dog, medical_recovery: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="ready_for_adoption"
                    checked={dog.ready_for_adoption}
                    onChange={(e) => setDog({ ...dog, ready_for_adoption: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="ready_for_adoption" className="cursor-pointer">
                    Ready for Adoption
                  </Label>
                </div>
              </div>

              {/* Emergency Status */}
              <div className="space-y-4 bg-red-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_emergency"
                    checked={dog.is_emergency}
                    onChange={(e) => setDog({ ...dog, is_emergency: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="is_emergency" className="cursor-pointer flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    This is an Emergency Case
                  </Label>
                </div>

                {dog.is_emergency && (
                  <div>
                    <Label htmlFor="emergency_explanation">Emergency Explanation</Label>
                    <Textarea
                      id="emergency_explanation"
                      value={dog.emergency_explanation}
                      onChange={(e) => setDog({ ...dog, emergency_explanation: e.target.value })}
                      rows={3}
                      placeholder="Explain why this is an emergency..."
                    />
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500 pt-4 border-t">
                Created: {new Date(dog.created_at).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
