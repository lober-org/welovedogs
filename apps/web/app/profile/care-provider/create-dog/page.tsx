"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBrowserClient } from "@/lib/supabase/client";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CreateDogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    story: "",
    current_condition: "",
    location: "",
    city: "",
    state: "",
    country: "",
    is_emergency: false,
    emergency_explanation: "",
    needs_surgery: false,
    medical_treatment: false,
    medical_recovery: false,
    ready_for_adoption: false,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    setImageFiles([...imageFiles, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createBrowserClient();

      // Get authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("You must be logged in to create a dog profile");
        router.push("/sign-in");
        return;
      }

      // Get care provider
      const { data: careProvider, error: cpError } = await supabase
        .from("care_providers")
        .select("id, type")
        .eq("auth_user_id", user.id)
        .single();

      if (cpError || !careProvider) {
        console.error("Error fetching care provider:", cpError);
        alert("Could not find your care provider profile");
        return;
      }

      // Upload images to Supabase Storage
      const imageUrls: string[] = [];
      for (const file of imageFiles) {
        const fileName = `${careProvider.id}/${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("dog-images")
          .upload(fileName, file);

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("dog-images").getPublicUrl(fileName);

        imageUrls.push(publicUrl);
      }

      console.log("Uploaded images:", imageUrls);

      // Capitalize requester type for enum
      const requesterType = careProvider.type.charAt(0).toUpperCase() + careProvider.type.slice(1);

      // Create dog profile
      const { data: dog, error: dogError } = await supabase
        .from("dogs")
        .insert({
          name: formData.name,
          story: formData.story,
          current_condition: formData.current_condition,
          location: formData.location || `${formData.city}, ${formData.state}, ${formData.country}`,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          is_emergency: formData.is_emergency,
          emergency_explanation: formData.emergency_explanation || null,
          needs_surgery: formData.needs_surgery,
          medical_treatment: formData.medical_treatment,
          medical_recovery: formData.medical_recovery,
          ready_for_adoption: formData.ready_for_adoption,
          images: imageUrls,
          care_provider_id: careProvider.id,
          requester_type: requesterType,
          headline: `${formData.name} needs your help`,
        })
        .select()
        .single();

      if (dogError) {
        console.error(" Error creating dog:", dogError);
        alert(`Failed to create dog profile: ${dogError.message}`);
        return;
      }

      console.log(" Dog created successfully:", dog);
      alert("Dog profile created successfully!");
      router.push("/profile/care-provider");
    } catch (error) {
      console.error(" Error in dog creation:", error);
      alert("An error occurred while creating the dog profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-50/50 to-white py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href="/profile/care-provider">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>
        </Link>

        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-purple-50">
            <CardTitle className="text-2xl">Create Dog Profile</CardTitle>
            <p className="text-sm text-gray-600">
              Add a dog to your care and create campaigns for them later
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>

                <div>
                  <Label htmlFor="name">Dog Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="story">Dog's Story *</Label>
                  <Textarea
                    id="story"
                    value={formData.story}
                    onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                    rows={4}
                    placeholder="Tell us about this dog's background and situation..."
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Location</h3>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Medical Information</h3>

                <div>
                  <Label htmlFor="current_condition">Current Medical Condition *</Label>
                  <Textarea
                    id="current_condition"
                    value={formData.current_condition}
                    onChange={(e) =>
                      setFormData({ ...formData, current_condition: e.target.value })
                    }
                    rows={3}
                    placeholder="Describe the current medical condition..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Treatment Status</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="needs_surgery"
                        checked={formData.needs_surgery}
                        onChange={(e) =>
                          setFormData({ ...formData, needs_surgery: e.target.checked })
                        }
                        className="rounded"
                      />
                      <Label htmlFor="needs_surgery" className="font-normal">
                        Needs Surgery
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="medical_treatment"
                        checked={formData.medical_treatment}
                        onChange={(e) =>
                          setFormData({ ...formData, medical_treatment: e.target.checked })
                        }
                        className="rounded"
                      />
                      <Label htmlFor="medical_treatment" className="font-normal">
                        Requires Medical Treatment
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="medical_recovery"
                        checked={formData.medical_recovery}
                        onChange={(e) =>
                          setFormData({ ...formData, medical_recovery: e.target.checked })
                        }
                        className="rounded"
                      />
                      <Label htmlFor="medical_recovery" className="font-normal">
                        In Medical Recovery
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="ready_for_adoption"
                        checked={formData.ready_for_adoption}
                        onChange={(e) =>
                          setFormData({ ...formData, ready_for_adoption: e.target.checked })
                        }
                        className="rounded"
                      />
                      <Label htmlFor="ready_for_adoption" className="font-normal">
                        Ready for Adoption
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4 border-t">
                  <input
                    type="checkbox"
                    id="is_emergency"
                    checked={formData.is_emergency}
                    onChange={(e) => setFormData({ ...formData, is_emergency: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="is_emergency" className="font-medium text-red-600">
                    This is an emergency case
                  </Label>
                </div>

                {formData.is_emergency && (
                  <div>
                    <Label htmlFor="emergency_explanation">Emergency Explanation *</Label>
                    <Textarea
                      id="emergency_explanation"
                      value={formData.emergency_explanation}
                      onChange={(e) =>
                        setFormData({ ...formData, emergency_explanation: e.target.value })
                      }
                      rows={3}
                      placeholder="Explain why this is an emergency..."
                      required
                    />
                  </div>
                )}
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Photos</h3>

                <div>
                  <Label htmlFor="images">Upload Dog Photos (Max 5)</Label>
                  <div className="mt-2">
                    <label htmlFor="images" className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Click to upload images</p>
                      </div>
                      <input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={preview || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            width={200}
                            height={200}
                            className="rounded-lg object-cover w-full h-32"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 flex-1"
                >
                  {loading ? "Creating..." : "Create Dog Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
