"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Upload, AlertCircle, X, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createBrowserClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";

const fundCategories = [
  "Surgery",
  "Emergency Care",
  "Medication",
  "Vaccination",
  "Spay/Neuter",
  "Dental Care",
  "Food",
  "Special Diet",
  "Shelter / Housing",
  "Grooming / Hygiene",
  "Rehabilitation / Training",
  "Behavioral Training",
  "Transportation",
  "Specialized Equipment",
  "Temporary Foster Care",
  "Other",
];

export default function CreateCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [careProviderId, setCareProviderId] = useState<string | null>(null);
  const [myDogs, setMyDogs] = useState<any[]>([]);
  const [selectedDog, setSelectedDog] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    fundraisingGoal: "",
    headline: "",
    selectedCategories: [] as string[],
    confirmed: false,
    stellarAddress: "",
    escrowContractId: "",
  });

  useEffect(() => {
    const fetchDogs = async () => {
      const supabase = createBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      const { data: careProvider, error: cpError } = await supabase
        .from("care_providers")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (cpError || !careProvider) {
        setError("Care provider profile not found");
        return;
      }

      setCareProviderId(careProvider.id);

      const { data: dogs, error: dogsError } = await supabase
        .from("dogs")
        .select(
          `
          *,
          campaigns(id, status)
        `
        )
        .eq("care_provider_id", careProvider.id)
        .order("created_at", { ascending: false });

      if (dogsError) {
        console.error("Error fetching dogs:", dogsError);
        return;
      }

      // Filter out dogs that already have active campaigns
      const availableDogs =
        dogs?.filter((dog: any) => !dog.campaigns?.some((c: any) => c.status === "Active")) || [];

      setMyDogs(availableDogs);
    };

    fetchDogs();
  }, [router]);

  const filteredDogs = myDogs.filter((dog) =>
    dog.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDog) {
      setError("Please select a dog for this campaign");
      return;
    }

    if (!careProviderId) {
      setError("Care provider ID not found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createBrowserClient();

      // Validate Stellar address format
      if (formData.stellarAddress) {
        // Basic Stellar address validation (56 characters, starts with G)
        if (!formData.stellarAddress.match(/^G[A-Z0-9]{55}$/)) {
          throw new Error(
            "Invalid Stellar address format. Stellar addresses should be 56 characters and start with 'G'."
          );
        }
      }

      const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .insert({
          dog_id: selectedDog.id,
          dog_name: selectedDog.name,
          dog_image: Array.isArray(selectedDog.images) ? selectedDog.images[0] : null,
          headline: formData.headline || `${selectedDog.name} needs your help`,
          current_condition: selectedDog.current_condition,
          care_provider_id: careProviderId,
          funds_needed_for: formData.selectedCategories,
          goal: parseFloat(formData.fundraisingGoal) || 0,
          raised: 0,
          spent: 0,
          status: "Active",
          stellar_address: formData.stellarAddress || null,
          escrow_id: formData.escrowContractId || null,
        })
        .select()
        .single();

      if (campaignError) {
        console.error("Error creating campaign:", campaignError);
        throw new Error(`Failed to create campaign: ${campaignError.message}`);
      }

      console.log("Campaign created successfully:", campaign);
      router.push("/profile/care-provider");
    } catch (err) {
      console.error("Error in campaign creation:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setFormData({
      ...formData,
      selectedCategories: formData.selectedCategories.includes(category)
        ? formData.selectedCategories.filter((c) => c !== category)
        : [...formData.selectedCategories, category],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/profile/care-provider">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-3">Create Campaign</h1>
          <p className="text-muted-foreground">
            Select a dog from your profile and create a fundraising campaign to help them get the
            care they need.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-900">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">1. Select a Dog</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose which dog you want to create a fundraising campaign for
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your dogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {myDogs.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    You don't have any dogs available for campaigns yet.
                  </p>
                  <Link href="/profile/care-provider/create-dog">
                    <Button>Create Dog Profile First</Button>
                  </Link>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredDogs.map((dog) => {
                  const image = Array.isArray(dog.images) ? dog.images[0] : null;
                  const isSelected = selectedDog?.id === dog.id;

                  return (
                    <Card
                      key={dog.id}
                      className={`cursor-pointer transition-all ${
                        isSelected ? "ring-2 ring-primary" : "hover:shadow-md"
                      }`}
                      onClick={() => setSelectedDog(dog)}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-1">
                          {image && (
                            <Image
                              src={image || "/placeholder.svg"}
                              alt={dog.name}
                              width={80}
                              height={80}
                              className="rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{dog.name}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {dog.current_condition}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {dog.is_emergency && (
                                <Badge variant="destructive" className="text-xs">
                                  Emergency
                                </Badge>
                              )}
                              {dog.needs_surgery && (
                                <Badge variant="secondary" className="text-xs">
                                  Surgery
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {selectedDog && (
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm font-semibold">Selected: {selectedDog.name}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-5">
              <div>
                <h3 className="text-xl font-semibold mb-2">2. Campaign Details</h3>
              </div>

              <div>
                <Label htmlFor="headline">
                  Campaign Headline <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="headline"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="e.g., Max needs emergency surgery"
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="fundraisingGoal">
                  Fundraising Goal (USD) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fundraisingGoal"
                  type="number"
                  value={formData.fundraisingGoal}
                  onChange={(e) => setFormData({ ...formData, fundraisingGoal: e.target.value })}
                  placeholder="e.g., 5000"
                  min="0"
                  step="0.01"
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <Label className="mb-3 block">
                  Funds Needed For <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {fundCategories.map((category) => (
                    <Button
                      key={category}
                      type="button"
                      variant={
                        formData.selectedCategories.includes(category) ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => toggleCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-5">
              <div>
                <h3 className="text-xl font-semibold mb-2">3. Payment Configuration</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure payment settings for this campaign
                </p>
              </div>

              <div>
                <Label htmlFor="stellarAddress">
                  Stellar Wallet Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="stellarAddress"
                  value={formData.stellarAddress}
                  onChange={(e) => setFormData({ ...formData, stellarAddress: e.target.value })}
                  placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  className="mt-1.5 font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The Stellar address where donations will be sent
                </p>
              </div>

              <div>
                <Label htmlFor="escrowContractId">
                  Escrow Contract ID <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                  id="escrowContractId"
                  value={formData.escrowContractId}
                  onChange={(e) => setFormData({ ...formData, escrowContractId: e.target.value })}
                  placeholder="Leave empty to create escrow later"
                  className="mt-1.5 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  If you already have an escrow contract, enter its ID here. Otherwise, you can
                  create one later from the campaign management page.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="confirmation"
                  checked={formData.confirmed}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, confirmed: checked as boolean })
                  }
                  required
                />
                <Label htmlFor="confirmation" className="text-sm cursor-pointer">
                  I confirm that the information provided is accurate and that I will share proof of
                  expenses and updates on the dog's progress.{" "}
                  <span className="text-red-500">*</span>
                </Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Link href="/profile/care-provider">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={!formData.confirmed || loading || !selectedDog}>
              {loading ? "Creating..." : "Create Campaign"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
