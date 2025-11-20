import type React from "react";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DonorProfileClient from "./DonorProfileClient";

export default async function DonorProfilePage() {
  const supabase = await createServerClient();

  // Get current user with better error handling
  let user = null;
  try {
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser();
    if (error || !authUser) {
      console.log(" Auth error or no user found, redirecting to sign-in");
      redirect("/sign-in");
    }
    user = authUser;
  } catch (error) {
    console.log(" Exception getting user:", error);
    redirect("/sign-in");
  }

  if (!user) {
    redirect("/sign-in");
  }

  const { data: donor } = await supabase
    .from("donors")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const { data: transactions } = donor
    ? await supabase
        .from("transactions")
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
        .eq("donor_id", donor.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const { data: quests } = await supabase
    .from("quests")
    .select("*")
    .eq("is_active", true)
    .order("requirement_value", { ascending: true });

  const { data: questProgress } = donor
    ? await supabase.from("donor_quest_progress").select("*").eq("donor_id", donor.id)
    : { data: [] };

  const { data: donorLevels } = await supabase
    .from("donor_levels")
    .select("*")
    .order("min_total_donated", { ascending: true });

  // Calculate donor's current level based on total donations and donation count
  const totalDonatedAmount =
    transactions?.reduce((sum, tx) => sum + Number(tx.usd_value || 0), 0) || 0;
  const donationCount = transactions?.length || 0;

  const currentLevel = donorLevels
    ?.reverse()
    .find(
      (level) =>
        totalDonatedAmount >= level.min_total_donated && donationCount >= level.min_donations
    ) ||
    donorLevels?.[0] || {
      name: "Newcomer",
      min_total_donated: 0,
      min_donations: 0,
      icon: "🌱",
      color: "gray",
      benefits: { perks: [] },
    };

  const donorData = donor
    ? {
        id: donor.id,
        firstName: donor.first_name,
        lastName: donor.last_name,
        email: donor.email,
        country: donor.country,
        phone: donor.phone,
        profilePicture: donor.profile_picture,
        stellarAddress: donor.stellar_address,
        memberSince: donor.member_since || donor.created_at,
        totalDonations: totalDonatedAmount,
        dogsSupported: donor.dogs_supported || 0,
      }
    : {
        id: user.id,
        firstName: user.email?.split("@")[0] || "Anonymous",
        lastName: "Donor",
        email: user.email || "",
        country: "United States",
        memberSince: user.created_at,
        totalDonations: 0,
        dogsSupported: 0,
      };

  const donations =
    transactions?.map((tx) => ({
      id: tx.id,
      dogName: tx.dogs?.name || "Unknown",
      dogImage: tx.dogs?.images?.[0] || "/placeholder.svg",
      amount: Number(tx.usd_value || 0),
      date: tx.created_at,
      transactionHash: tx.tx_hash || "",
    })) || [];

  return (
    <DonorProfileClient
      donorData={donorData}
      donations={donations}
      quests={quests || []}
      questProgress={questProgress || []}
      donorLevels={donorLevels || []}
      currentLevel={currentLevel}
    />
  );
}
