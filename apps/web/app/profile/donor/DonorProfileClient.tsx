"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Heart,
  Mail,
  DollarSign,
  Award,
  Calendar,
  ExternalLink,
  Camera,
  Edit2,
  Save,
  X,
  Phone,
  MapPin,
  Trophy,
  Star,
  CheckCircle2,
  Lock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import DonorNFTGallery from "./DonorNFTGallery";

interface DonorData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  phone?: string;
  profilePicture?: string;
  stellarAddress?: string;
  memberSince: string;
  totalDonations: number;
  dogsSupported: number;
}

interface Donation {
  id: string;
  dogName: string;
  dogImage: string;
  amount: number;
  date: string;
  transactionHash: string;
  donationType?: "escrow" | "instant";
  escrowContractId?: string | null;
  campaignId?: string | null;
}

interface Quest {
  id: string;
  name: string;
  description: string;
  requirement_type: string;
  requirement_value: number;
  badge_image: string;
  points: number;
  progress?: number;
  completed?: boolean;
}

interface DonorLevel {
  name: string;
  min_total_donated: number;
  min_donations: number;
  icon: string;
  color: string;
  benefits: { perks: string[] };
}

interface NFTAchievement {
  id: string;
  nft_token_id: string;
  blockchain_tx_hash?: string;
  metadata?: {
    metadataIpfsUrl?: string;
    imageIpfsUrl?: string;
    dogName?: string;
    donationAmount?: number;
    transactionId?: string;
  };
  earned_at: string;
}

export default function DonorProfileClient({
  donorData: initialDonorData,
  donations,
  quests,
  questProgress,
  donorLevels,
  currentLevel,
  nftAchievements = [],
  contractId,
}: {
  donorData: DonorData;
  donations: Donation[];
  quests: Quest[];
  questProgress: any[];
  donorLevels: DonorLevel[];
  currentLevel: DonorLevel;
  nftAchievements?: NFTAchievement[];
  contractId?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [donorData, setDonorData] = useState({
    ...initialDonorData,
    phone: initialDonorData.phone || "",
    stellarAddress: initialDonorData.stellarAddress || "",
    profilePicture: initialDonorData.profilePicture || "",
  });
  const [editFormData, setEditFormData] = useState({
    ...initialDonorData,
    phone: initialDonorData.phone || "",
    stellarAddress: initialDonorData.stellarAddress || "",
    profilePicture: initialDonorData.profilePicture || "",
  });
  const [profilePicture, setProfilePicture] = useState<string | null>(
    donorData.profilePicture || null
  );
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setEditFormData({ ...editFormData, profilePicture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setDonorData(editFormData);
    setProfilePicture(editFormData.profilePicture || null);
    setIsEditing(false);
    setPhotoPreview(null);
  };

  const handleCancel = () => {
    setEditFormData(donorData);
    setPhotoPreview(null);
    setIsEditing(false);
  };

  const totalDonationsCount = donations.length;
  const totalDonatedAmount = donations.reduce((sum, d) => sum + d.amount, 0);
  const maxSingleDonation = donations.length > 0 ? Math.max(...donations.map((d) => d.amount)) : 0;
  const uniqueDogsSupported = new Set(donations.map((d) => d.dogName)).size;

  const calculateQuestProgress = (quest: Quest) => {
    let progress = 0;
    switch (quest.requirement_type) {
      case "donation_count":
        progress = totalDonationsCount;
        break;
      case "single_donation":
        progress = maxSingleDonation;
        break;
      case "total_donations":
        progress = totalDonatedAmount;
        break;
      case "unique_dogs":
        progress = uniqueDogsSupported;
        break;
      default:
        progress = 0;
    }

    const completed = progress >= quest.requirement_value;
    const progressPercent = Math.min((progress / quest.requirement_value) * 100, 100);

    return {
      ...quest,
      progress,
      completed,
      progressPercent,
    };
  };

  const enrichedQuests = quests.map(calculateQuestProgress);
  const completedQuests = enrichedQuests.filter((q) => q.completed);
  const incompleteQuests = enrichedQuests.filter((q) => !q.completed);
  const totalPoints = completedQuests.reduce((sum, q) => sum + q.points, 0);

  const currentLevelIndex = donorLevels.findIndex((l) => l.name === currentLevel.name);
  const nextLevel =
    currentLevelIndex < donorLevels.length - 1 ? donorLevels[currentLevelIndex + 1] : null;
  const levelProgress = nextLevel
    ? Math.min((totalDonatedAmount / nextLevel.min_total_donated) * 100, 100)
    : 100;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-50/50 to-white bg-cover bg-center"
      style={{ backgroundImage: "url('/purple-paw-background.png')" }}
    >
      <div className="container mx-auto px-3 py-4 md:px-4 md:py-8">
        <div className="mx-auto max-w-6xl">
          <Card className="mb-6 md:mb-8 overflow-hidden shadow-xl border-2 border-purple-200 p-0">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-purple-100 via-purple-50 to-white p-6 md:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                  <div className="relative group">
                    <div className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-full bg-white shadow-lg flex-shrink-0 overflow-hidden border-4 border-purple-200">
                      {photoPreview || profilePicture ? (
                        <Image
                          src={photoPreview || profilePicture || "/placeholder.svg"}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Heart className="h-10 w-10 md:h-12 md:w-12 text-purple-600" />
                      )}
                    </div>
                    {isEditing && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-purple-600 p-0 hover:bg-purple-700 shadow-lg"
                        >
                          <Camera className="h-4 w-4 text-white" />
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          className="hidden"
                        />
                      </>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                          {donorData.firstName} {donorData.lastName}
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-2xl">{currentLevel.icon}</span>
                          <span
                            className={`text-sm font-bold px-3 py-1 rounded-full bg-${currentLevel.color}-100 text-${currentLevel.color}-700 border border-${currentLevel.color}-300`}
                          >
                            {currentLevel.name} Level
                          </span>
                          <span className="text-sm text-gray-600">• {totalPoints} points</span>
                        </div>
                      </div>
                      {!isEditing && (
                        <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit Profile
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm md:text-base text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <span>
                          Member since{" "}
                          {new Date(donorData.memberSince).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 fill-purple-600 text-purple-600" />
                        <span>{uniqueDogsSupported} dogs supported</span>
                      </div>
                    </div>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-4 bg-white rounded-lg border-2 border-purple-200 p-6 mb-4 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Edit Profile</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={editFormData.firstName}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, firstName: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={editFormData.lastName}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, lastName: e.target.value })
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
                        <Label htmlFor="phone">Phone (Optional)</Label>
                        <Input
                          id="phone"
                          value={editFormData.phone}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, phone: e.target.value })
                          }
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={editFormData.country}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, country: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="stellarAddress">Stellar Address (Optional)</Label>
                        <Input
                          id="stellarAddress"
                          value={editFormData.stellarAddress}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, stellarAddress: e.target.value })
                          }
                          placeholder="GXXXXX..."
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-4 border-t">
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
                  <div className="bg-white rounded-lg border-2 border-purple-200 p-4 md:p-6 mb-4 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Mail className="h-5 w-5 text-purple-600" />
                      Basic Information
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Email</p>
                        <p className="text-base font-semibold text-gray-800">{donorData.email}</p>
                      </div>
                      {donorData.phone && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Phone</p>
                          <p className="text-base font-semibold text-gray-800 flex items-center gap-2">
                            <Phone className="h-4 w-4 text-purple-600" />
                            {donorData.phone}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Country</p>
                        <p className="text-base font-semibold text-gray-800 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-purple-600" />
                          {donorData.country}
                        </p>
                      </div>
                      {donorData.stellarAddress && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Stellar Address</p>
                          <p className="text-base font-mono text-sm text-gray-800 break-all">
                            {donorData.stellarAddress}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {nextLevel && (
                  <div className="bg-white rounded-lg border-2 border-purple-200 p-4 md:p-6 mb-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-purple-600" />
                        <h3 className="text-base font-bold text-gray-800">
                          Next Level: {nextLevel.name} {nextLevel.icon}
                        </h3>
                      </div>
                      <span className="text-sm text-gray-600">
                        ${totalDonatedAmount.toFixed(0)} / ${nextLevel.min_total_donated}
                      </span>
                    </div>
                    <Progress value={levelProgress} className="h-3 bg-gray-200" />
                    <p className="text-xs text-gray-600 mt-2">
                      ${(nextLevel.min_total_donated - totalDonatedAmount).toFixed(0)} more to
                      unlock {nextLevel.name} level
                    </p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-lg bg-white border-2 border-green-200 p-4 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <DollarSign className="h-6 w-6 text-green-700" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Donated</p>
                      <p className="text-xl md:text-2xl font-bold text-gray-800">
                        ${totalDonatedAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-white border-2 border-purple-200 p-4 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                      <Heart className="h-6 w-6 text-purple-700 fill-purple-700" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Dogs Supported</p>
                      <p className="text-xl md:text-2xl font-bold text-gray-800">
                        {uniqueDogsSupported}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="quests" className="space-y-4 md:space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="quests">Quests</TabsTrigger>
              <TabsTrigger value="badges">POD Badges</TabsTrigger>
              <TabsTrigger value="nfts">My NFTs</TabsTrigger>
              <TabsTrigger value="donations">Donations</TabsTrigger>
            </TabsList>

            <TabsContent value="quests">
              <Card className="shadow-xl">
                <CardContent className="p-4 md:p-6">
                  <div className="mb-6 md:mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <Trophy className="h-6 w-6 text-purple-600" />
                      Quest Progress
                    </h2>
                    <p className="text-sm md:text-base text-gray-600 mb-4">
                      Complete quests to earn POD (Proof of Donation) badges and climb the donor
                      ranks!
                    </p>
                    <div className="flex items-center gap-4 text-sm md:text-base">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700">
                          <span className="font-bold">{completedQuests.length}</span> /{" "}
                          {quests.length} Completed
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-gray-700">
                          <span className="font-bold">{totalPoints}</span> Points Earned
                        </span>
                      </div>
                    </div>
                  </div>

                  {incompleteQuests.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-gray-700 mb-4">In Progress</h3>
                      <div className="grid gap-4">
                        {incompleteQuests.map((quest) => (
                          <div
                            key={quest.id}
                            className="relative overflow-hidden rounded-lg border-2 border-gray-200 bg-white p-4 shadow-md hover:border-purple-300 transition-colors"
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                <Lock className="h-8 w-8 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div>
                                    <h4 className="text-lg font-bold text-gray-800">
                                      {quest.name}
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {quest.description}
                                    </p>
                                  </div>
                                  <span className="flex items-center gap-1 text-sm font-bold text-purple-600 whitespace-nowrap">
                                    <Star className="h-4 w-4 fill-purple-600" />
                                    {quest.points}
                                  </span>
                                </div>
                                <div className="mt-3">
                                  <div className="flex items-center justify-between text-sm mb-1">
                                    <span className="text-gray-600">Progress</span>
                                    <span className="font-semibold text-gray-800">
                                      {quest.progress} / {quest.requirement_value}
                                      {quest.requirement_type === "total_donations" ||
                                      quest.requirement_type === "single_donation"
                                        ? " USD"
                                        : ""}
                                    </span>
                                  </div>
                                  <Progress
                                    value={quest.progressPercent}
                                    className="h-2 bg-gray-200"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {completedQuests.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        Completed Quests
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {completedQuests.map((quest) => (
                          <div
                            key={quest.id}
                            className="relative overflow-hidden rounded-lg border-2 border-green-300 bg-gradient-to-br from-green-50 to-white p-4 shadow-md"
                          >
                            <div className="absolute top-2 right-2">
                              <CheckCircle2 className="h-6 w-6 text-green-600 fill-green-600" />
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 border-2 border-green-300">
                                <Trophy className="h-7 w-7 text-green-700" />
                              </div>
                              <div className="flex-1 pr-6">
                                <h4 className="text-base font-bold text-gray-800 mb-1">
                                  {quest.name}
                                </h4>
                                <p className="text-xs text-gray-600 mb-2">{quest.description}</p>
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                  <Star className="h-3 w-3 fill-green-700" />+{quest.points} points
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {completedQuests.length === 0 && (
                    <div className="text-center py-12">
                      <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-semibold text-gray-700 mb-2">
                        No quests completed yet
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        Start donating to unlock your first quest!
                      </p>
                      <Link href="/donate">
                        <Button className="bg-purple-600 hover:bg-purple-700">
                          Browse Dogs in Need
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="badges">
              <Card className="shadow-xl">
                <CardContent className="p-4 md:p-6">
                  <div className="mb-6 md:mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <Award className="h-6 w-6 text-purple-600" />
                      POD Badge Collection
                    </h2>
                    <p className="text-sm md:text-base text-gray-600">
                      Your earned Proof of Donation badges. Complete quests to unlock badges and
                      mint them as NFTs!
                    </p>
                  </div>

                  {completedQuests.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {completedQuests.map((quest) => (
                        <div
                          key={quest.id}
                          className="group relative overflow-hidden rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                        >
                          <div className="absolute top-2 right-2">
                            <div className="rounded-full bg-green-500 p-1">
                              <CheckCircle2 className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="flex flex-col items-center text-center">
                            <div className="mb-4 relative h-24 w-24">
                              <Image
                                src={quest.badge_image || "/placeholder.svg"}
                                alt={quest.name}
                                fill
                                className="object-contain"
                              />
                            </div>
                            <h4 className="text-lg font-bold text-gray-800 mb-2">{quest.name}</h4>
                            <p className="text-xs text-gray-600 mb-3">{quest.description}</p>
                            <div className="flex items-center gap-2 text-sm">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-bold text-gray-700">{quest.points} points</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-semibold text-gray-700 mb-2">
                        No badges earned yet
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        Complete quests to earn your first POD badge!
                      </p>
                      <Link href="/donate">
                        <Button className="bg-purple-600 hover:bg-purple-700">
                          Start Your Journey
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="nfts">
              <Card className="shadow-xl">
                <CardContent className="p-4 md:p-6">
                  <div className="mb-6 md:mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <Award className="h-6 w-6 text-purple-600" />
                      My Proof of Donation NFTs
                    </h2>
                    <p className="text-sm md:text-base text-gray-600">
                      Your minted Proof of Donation NFTs. Each NFT is a permanent, verifiable record
                      of your generosity on the blockchain.
                    </p>
                  </div>
                  <DonorNFTGallery nftAchievements={nftAchievements} contractId={contractId} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="donations">
              <Card className="shadow-xl">
                <CardContent className="p-4 md:p-6">
                  <div className="mb-4 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">My Donations</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-semibold">{donations.length}</span> total donations
                    </div>
                  </div>

                  <div className="space-y-3">
                    {donations.map((donation) => (
                      <div
                        key={donation.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-lg border border-gray-200 p-3 md:p-4 transition-all hover:border-purple-300 hover:shadow-md"
                      >
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={donation.dogImage || "/placeholder.svg"}
                            alt={donation.dogName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 w-full">
                          <h3 className="text-base md:text-lg font-bold text-gray-800 mb-1">
                            {donation.dogName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(donation.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            {donation.transactionHash && (
                              <a
                                href={
                                  donation.transactionHash
                                    ? `https://stellar.expert/explorer/${process.env.NEXT_PUBLIC_STELLAR_NETWORK === "public" ? "public" : "testnet"}/tx/${donation.transactionHash}`
                                    : "#"
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-purple-600 hover:text-purple-700 hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View Transaction
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <span className="rounded-full bg-green-100 px-3 py-1 text-sm md:text-base font-bold text-green-700">
                            ${donation.amount}
                          </span>
                        </div>
                      </div>
                    ))}
                    {donations.length === 0 && (
                      <div className="py-12 text-center text-gray-500">
                        <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-semibold mb-2">No donations yet</p>
                        <p className="text-sm mb-4">Be the first to make a difference!</p>
                        <Link href="/donate">
                          <Button className="bg-purple-600 hover:bg-purple-700">
                            Browse Dogs in Need
                          </Button>
                        </Link>
                      </div>
                    )}
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
