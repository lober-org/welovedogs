"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Edit2,
  Save,
  X,
  Phone,
  Mail,
  Globe,
  Linkedin,
  Instagram,
  DollarSign,
  TrendingUp,
  Camera,
  ChevronRight,
  Calendar,
  ArrowUpDown,
  MapPin,
  Heart,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { parseStory, type StoryQA } from "@/lib/parse-story";
import { generateAboutFromStory } from "@/app/actions/generate-about";

interface ProfileData {
  name: string;
  clinicName: string;
  profilePhoto: string;
  about: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  instagram: string;
  location: string;
  rating: number;
  dogsHelped: number;
  story: string | null;
  type: "veterinarian" | "shelter" | "rescuer";
}

interface Campaign {
  dogId: string;
  dogName: string;
  dogImage: string;
  raised: number;
  goal: number;
  spent: number;
  status: string;
  createdDate: string;
}

interface Dog {
  id: string;
  name: string;
  images: string[];
  story: string;
  currentCondition: string;
  location: string;
  isEmergency: boolean;
  needsSurgery: boolean;
  medicalTreatment: string;
  medicalRecovery: string;
  readyForAdoption: boolean;
  createdAt: string;
}

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
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [campaignSortOrder, setCampaignSortOrder] = useState<"newest" | "oldest">("newest");
  const [campaignStatusFilter, setCampaignStatusFilter] = useState<"all" | "active" | "closed">(
    "all"
  );
  const [profileData, setProfileData] = useState(initialProfileData);
  const [editFormData, setEditFormData] = useState(initialProfileData);
  const [storyAnswers, setStoryAnswers] = useState<string[]>(() => {
    const parsedStory = parseStory(initialProfileData.story, initialProfileData.type);
    return parsedStory.map((qa) => qa.answer);
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const campaigns = initialCampaigns;
  const dogs = initialDogs;

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (campaignStatusFilter === "all") return true;
    if (campaignStatusFilter === "active") return campaign.status === "Active";
    if (campaignStatusFilter === "closed") return campaign.status === "Closed";
    return true;
  });

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    const dateA = new Date(a.createdDate).getTime();
    const dateB = new Date(b.createdDate).getTime();
    return campaignSortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

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

  const handleSaveStory = () => {
    const newStory = storyAnswers.join("\n\n");
    setProfileData({ ...profileData, story: newStory });
    setIsEditingStory(false);
    // TODO: Save to database
  };

  const handleCancel = () => {
    setEditFormData(profileData);
    setIsEditing(false);
    setPhotoPreview(null);
  };

  const handleCancelStory = () => {
    const parsedStory = parseStory(profileData.story, profileData.type);
    setStoryAnswers(parsedStory.map((qa) => qa.answer));
    setIsEditingStory(false);
  };

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

  const storyQA = parseStory(profileData.story, profileData.type);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-50/50 to-white">
      <div className="container mx-auto px-3 py-4 md:px-4 md:py-8">
        <div className="mx-auto max-w-6xl">
          <Card className="mb-6 md:mb-8 overflow-hidden shadow-xl p-0">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-purple-100 via-purple-50 to-white p-6 md:p-8">
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
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
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
                        <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
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
                        <span className="font-semibold text-purple-600">
                          {profileData.dogsHelped}
                        </span>
                        <span>dogs helped</span>
                      </div>
                    </div>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-4 bg-white rounded-lg p-6 border-2 border-purple-200">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={editFormData.name}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, name: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="clinicName">Clinic/Organization Name</Label>
                        <Input
                          id="clinicName"
                          value={editFormData.clinicName}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, clinicName: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editFormData.email}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, email: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={editFormData.phone}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, phone: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={editFormData.website}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, website: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={editFormData.location}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, location: e.target.value })
                          }
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
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, about: e.target.value })
                          }
                          rows={4}
                          placeholder="Write a brief description about yourself and your work, or use AI to generate one based on your story..."
                        />
                        {!profileData.story && (
                          <p className="text-xs text-gray-500 mt-1">
                            Add your story first to use AI generation
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button onClick={handleCancel} variant="outline">
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border-2 border-purple-200 p-6 mt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">About</h3>
                    <p className="text-gray-600 mb-4">
                      {profileData.about || "No about section provided."}
                    </p>

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
                )}

                <div className="grid gap-4 sm:grid-cols-2 mt-6">
                  <div className="flex items-center gap-3 rounded-lg bg-white border-2 border-green-200 p-4 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <DollarSign className="h-6 w-6 text-green-700" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Received</p>
                      <p className="text-xl md:text-2xl font-bold text-gray-800">
                        ${totalReceived.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-white border-2 border-blue-200 p-4 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <TrendingUp className="h-6 w-6 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Spent</p>
                      <p className="text-xl md:text-2xl font-bold text-gray-800">
                        ${totalSpent.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
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
              <Card className="shadow-xl bg-purple-50">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                      Campaign Management
                    </h2>
                    <div className="flex gap-2 flex-wrap">
                      <select
                        className="px-3 py-2 border rounded-lg text-sm"
                        value={campaignStatusFilter}
                        onChange={(e) => setCampaignStatusFilter(e.target.value as any)}
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCampaignSortOrder(campaignSortOrder === "newest" ? "oldest" : "newest")
                        }
                      >
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        {campaignSortOrder === "newest" ? "Newest" : "Oldest"}
                      </Button>
                      <Link href="/profile/care-provider/create-dog">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-purple-600 text-purple-600 hover:bg-purple-50"
                        >
                          Create Dog Profile
                        </Button>
                      </Link>
                      <Link href="/profile/care-provider/create-campaign">
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                          Create New Campaign
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {sortedCampaigns.map((campaign) => (
                      <Link
                        href={`/profile/care-provider/campaign/${campaign.dogId}`}
                        key={campaign.dogId}
                      >
                        <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-lg border-2 border-purple-200 p-4 hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer">
                          <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden">
                            <Image
                              src={campaign.dogImage || "/placeholder.svg"}
                              alt={campaign.dogName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-bold text-gray-800">
                                  {campaign.dogName}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(campaign.createdDate).toLocaleDateString()}
                                </div>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  campaign.status === "Active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {campaign.status}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-semibold">
                                  ${campaign.raised.toLocaleString()} / $
                                  {campaign.goal.toLocaleString()}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-purple-600 h-2 rounded-full transition-all"
                                  style={{
                                    width: `${Math.min((campaign.raised / campaign.goal) * 100, 100)}%`,
                                  }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-gray-600">
                                <span>Spent: ${campaign.spent.toLocaleString()}</span>
                                <span>
                                  {Math.round((campaign.raised / campaign.goal) * 100)}% funded
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 self-center" />
                        </div>
                      </Link>
                    ))}
                  </div>

                  {sortedCampaigns.length === 0 && (
                    <div className="py-12 text-center text-gray-500">
                      <p>
                        {campaignStatusFilter === "all"
                          ? "No campaigns yet"
                          : `No ${campaignStatusFilter} campaigns`}
                      </p>
                      <Link href="/profile/care-provider/create-campaign">
                        <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                          Create Your First Campaign
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dogs">
              <Card className="shadow-xl bg-purple-50">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">My Dogs</h2>
                    <Link href="/profile/care-provider/create-dog">
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        Add New Dog
                      </Button>
                    </Link>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {dogs.map((dog) => (
                      <Link href={`/profile/care-provider/dog/${dog.id}`} key={dog.id}>
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
                    ))}
                  </div>

                  {dogs.length === 0 && (
                    <div className="py-12 text-center text-gray-500">
                      <p>No dogs added yet</p>
                      <Link href="/profile/care-provider/create-dog">
                        <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                          Add Your First Dog
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="story">
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
                      {parseStory(profileData.story, profileData.type).map((qa, index) => (
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

                      <div className="flex gap-2 justify-end pt-4 border-t">
                        <Button onClick={handleCancelStory} variant="outline">
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveStory}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save Story
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {storyQA.length > 0 ? (
                        storyQA.map((qa, index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-br from-purple-50 to-white rounded-lg border-2 border-purple-200 p-6"
                          >
                            <h3 className="text-base font-bold text-purple-700 mb-3">
                              {index + 1}. {qa.question}
                            </h3>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {qa.answer || "No answer provided yet."}
                            </p>
                          </div>
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
            </TabsContent>

            <TabsContent value="profile">
              <Card className="shadow-xl">
                <CardContent className="p-4 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
                    Profile Information
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Contact Information
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Email</p>
                          <p className="text-base font-semibold text-gray-800">
                            {profileData.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Phone</p>
                          <p className="text-base font-semibold text-gray-800">
                            {profileData.phone}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Location</p>
                          <p className="text-base font-semibold text-gray-800">
                            {profileData.location}
                          </p>
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
                          <p className="text-2xl font-bold text-purple-600">
                            {profileData.dogsHelped}
                          </p>
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
