"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, ImageIcon, X, Eye, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

export default function PostUpdatePage() {
  const params = useParams();
  const router = useRouter();
  const dogId = params.dogId as string;
  const supabase = createBrowserClient();

  const [updateForm, setUpdateForm] = useState({
    title: "",
    content: "",
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUpdateForm({ ...updateForm, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to post updates");
      }

      console.log(" Publishing update for dog:", dogId);

      const { data: careProvider, error: careProviderError } = await supabase
        .from("care_providers")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (careProviderError || !careProvider) {
        throw new Error("Care provider profile not found");
      }

      console.log(" Found care provider:", careProvider.id);

      const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .select("id")
        .eq("dog_id", dogId)
        .single();

      if (campaignError || !campaign) {
        throw new Error("Campaign not found for this dog");
      }

      console.log(" Found campaign:", campaign.id);

      let imageUrl: string | null = null;
      if (updateForm.image) {
        const fileExt = updateForm.image.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        console.log(" Uploading image:", fileName);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("campaign-updates")
          .upload(fileName, updateForm.image, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error(" Error uploading image:", uploadError);
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("campaign-updates").getPublicUrl(fileName);

        imageUrl = publicUrl;
        console.log(" Image uploaded successfully:", imageUrl);
      }

      const { data: updateData, error: updateError } = await supabase
        .from("campaign_updates")
        .insert({
          campaign_id: campaign.id,
          dog_id: dogId,
          title: updateForm.title,
          content: updateForm.content,
          image: imageUrl,
          created_by: careProvider.id,
        })
        .select()
        .single();

      if (updateError) {
        console.error(" Error creating update:", updateError);
        throw new Error(`Failed to create update: ${updateError.message}`);
      }

      console.log(" Update published successfully:", updateData);

      router.push(`/profile/care-provider/campaign/${dogId}`);
    } catch (err: any) {
      console.error(" Error in handlePublish:", err);
      setError(err.message || "Failed to publish update");
      setIsLoading(false);
    }
  };

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-3 py-4 md:px-4 md:py-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-4 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(false)}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Edit
              </Button>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Preview Your Update</h1>
              <div className="hidden sm:block sm:w-24" />
            </div>

            <Card className="mb-4 md:mb-6 border-2 border-yellow-400 bg-yellow-50">
              <CardContent className="flex items-start gap-2 md:gap-3 p-3 md:p-4">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-yellow-600" />
                <div>
                  <h3 className="mb-1 text-sm md:text-base font-semibold text-yellow-900">
                    Important: Updates cannot be edited
                  </h3>
                  <p className="text-xs md:text-sm text-yellow-800">
                    Once published, this update will be visible to all donors and cannot be
                    modified. Please review carefully before publishing.
                  </p>
                </div>
              </CardContent>
            </Card>

            {error && (
              <Card className="mb-4 md:mb-6 border-2 border-red-400 bg-red-50">
                <CardContent className="flex items-start gap-2 md:gap-3 p-3 md:p-4">
                  <AlertCircle className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-red-600" />
                  <div>
                    <h3 className="mb-1 text-sm md:text-base font-semibold text-red-900">Error</h3>
                    <p className="text-xs md:text-sm text-red-800">{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="mb-4 md:mb-6 shadow-xl">
              <CardContent className="p-4 md:p-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="relative h-10 w-10 md:h-12 md:w-12 overflow-hidden rounded-full">
                    <Image
                      src="/placeholder.svg"
                      alt="Care Provider"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm md:text-base font-semibold text-gray-800">
                      Care Provider
                    </p>
                    <p className="text-xs md:text-sm text-gray-500">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <h2 className="mb-4 text-2xl md:text-3xl font-bold text-gray-800">
                  {updateForm.title}
                </h2>

                {imagePreview && (
                  <div className="relative mb-4 md:mb-6 h-64 md:h-96 overflow-hidden rounded-lg">
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Update"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="prose max-w-none">
                  <p className="text-sm md:text-base whitespace-pre-wrap text-gray-700">
                    {updateForm.content}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:flex-1 bg-transparent"
                onClick={() => setShowPreview(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                size="lg"
                className="w-full sm:flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={handlePublish}
                disabled={isLoading}
              >
                <Upload className="mr-2 h-5 w-5" />
                {isLoading ? "Publishing..." : "Publish Update"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-3 py-4 md:px-4 md:py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 md:mb-6 flex items-center gap-4">
            <Link href={`/profile/care-provider/campaign/${dogId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Back to Campaign</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
          </div>

          <Card className="shadow-xl">
            <CardContent className="p-4 md:p-8">
              <div className="mb-6">
                <h1 className="mb-2 text-2xl md:text-3xl font-bold text-gray-800">
                  Post Campaign Update
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  Share progress with your donors and keep them informed
                </p>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div>
                  <Label htmlFor="title" className="mb-2 block text-sm md:text-base font-semibold">
                    Update Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Luna's Recovery Progress"
                    value={updateForm.title}
                    onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
                    className="text-base md:text-lg"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="content"
                    className="mb-2 block text-sm md:text-base font-semibold"
                  >
                    Update Content *
                  </Label>
                  <Textarea
                    id="content"
                    rows={8}
                    placeholder="Share details about the dog's progress, recovery, or any news..."
                    value={updateForm.content}
                    onChange={(e) => setUpdateForm({ ...updateForm, content: e.target.value })}
                    className="text-sm md:text-base"
                  />
                  <p className="mt-2 text-xs md:text-sm text-gray-500">
                    {updateForm.content.length} characters
                  </p>
                </div>

                <div>
                  <Label className="mb-2 block text-sm md:text-base font-semibold">
                    Update Photo (Optional)
                  </Label>
                  {imagePreview ? (
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="h-48 md:h-64 w-full object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 md:right-4 md:top-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setImagePreview(null);
                          setUpdateForm({ ...updateForm, image: null });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="image"
                      className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-8 md:py-12 transition-colors hover:border-purple-400 hover:bg-purple-50"
                    >
                      <ImageIcon className="mb-3 h-10 w-10 md:h-12 md:w-12 text-gray-400" />
                      <span className="mb-1 text-sm md:text-base font-medium text-gray-700">
                        Click to upload image
                      </span>
                      <span className="text-xs md:text-sm text-gray-500">PNG, JPG up to 10MB</span>
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
                  <Link
                    href={`/profile/care-provider/campaign/${dogId}`}
                    className="w-full sm:flex-1"
                  >
                    <Button variant="outline" size="lg" className="w-full bg-transparent">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    className="w-full sm:flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    disabled={!updateForm.title || !updateForm.content}
                    onClick={() => setShowPreview(true)}
                  >
                    <Eye className="mr-2 h-5 w-5" />
                    Preview Update
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
