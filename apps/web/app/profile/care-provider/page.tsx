import type React from "react";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CareProviderProfileClient from "./CareProviderProfileClient";

export default async function CareProviderProfilePage() {
  const supabase = await createServerClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("Care provider profile page - User:", user?.id);

  if (!user) {
    redirect("/sign-in");
  }

  const { data: careProvider, error: careProviderError } = await supabase
    .from("care_providers")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  console.log("Care provider data:", careProvider);
  console.log("Care provider error:", careProviderError);

  console.log("Querying campaigns for care_provider_id:", careProvider?.id);

  if (!careProvider) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
        <p className="text-muted-foreground mb-4">
          Please complete your care provider registration.
        </p>
        <a href="/register/care-provider" className="text-primary underline">
          Complete Registration
        </a>
      </div>
    );
  }

  const { data: campaigns, error: campaignsError } = await supabase
    .from("campaigns")
    .select(
      `
      *,
      dogs (
        id,
        name,
        images
      )
    `
    )
    .eq("care_provider_id", careProvider.id)
    .order("created_at", { ascending: false });

  const { data: dogs, error: dogsError } = await supabase
    .from("dogs")
    .select("*")
    .eq("care_provider_id", careProvider.id)
    .order("created_at", { ascending: false });

  // Fetch donation totals for all campaigns
  const campaignIds = campaigns?.map((c) => c.id) || [];
  let donationTotals: Record<string, number> = {};

  if (campaignIds.length > 0) {
    const { data: donations } = await supabase
      .from("transactions")
      .select("campaign_id, usd_value")
      .in("campaign_id", campaignIds)
      .eq("type", "donation");

    // Calculate totals per campaign
    donations?.forEach((donation) => {
      const campaignId = donation.campaign_id;
      if (campaignId) {
        if (!donationTotals[campaignId]) {
          donationTotals[campaignId] = 0;
        }
        donationTotals[campaignId] += Number(donation.usd_value || 0);
      }
    });
  }

  const profileData = {
    name: careProvider.name || "Care Provider",
    clinicName: careProvider.clinic_name || careProvider.org_name || "",
    profilePhoto: careProvider.profile_photo || careProvider.image || "/placeholder.svg",
    about: careProvider.about || careProvider.description || careProvider.org_description || "",
    email: careProvider.email || "",
    phone: careProvider.phone || "",
    website: careProvider.website || "",
    linkedin: careProvider.social_media?.linkedin || "",
    instagram: careProvider.social_media?.instagram || "",
    location: careProvider.location || `${careProvider.city}, ${careProvider.state}`,
    rating: Number(careProvider.rating || 0),
    dogsHelped: careProvider.dogs_helped || 0,
    story: careProvider.story || null,
    type: careProvider.type as "veterinarian" | "shelter" | "rescuer",
  };

  const campaignsData =
    campaigns?.map((campaign) => ({
      dogId: campaign.dog_id,
      dogName: campaign.dog_name || campaign.dogs?.name || "Unknown",
      dogImage: campaign.dog_image || campaign.dogs?.images?.[0] || "/placeholder.svg",
      raised: donationTotals[campaign.id] || 0, // Use donation totals instead of campaign.raised
      goal: Number(campaign.goal || 0),
      spent: Number(campaign.spent || 0),
      status: campaign.status || "Active",
      createdDate: campaign.created_at,
    })) || [];

  const dogsData =
    dogs?.map((dog) => ({
      id: dog.id,
      name: dog.name,
      images: dog.images || [],
      story: dog.story || "",
      currentCondition: dog.current_condition || "",
      location: dog.location || `${dog.city}, ${dog.state}` || "",
      isEmergency: dog.is_emergency || false,
      needsSurgery: dog.needs_surgery || false,
      medicalTreatment: dog.medical_treatment || "",
      medicalRecovery: dog.medical_recovery || "",
      readyForAdoption: dog.ready_for_adoption || false,
      createdAt: dog.created_at,
    })) || [];

  console.log(" Transformed dogs data:", dogsData);

  return (
    <CareProviderProfileClient
      profileData={profileData}
      campaigns={campaignsData}
      dogs={dogsData}
    />
  );
}
