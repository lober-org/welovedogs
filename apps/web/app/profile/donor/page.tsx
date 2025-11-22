/**
 * Donor Profile Page
 *
 * Data Sources:
 * 1. Supabase Database:
 *    - Donor profile data (donors table)
 *    - Donation transactions (transactions table) - includes both escrow and instant donations
 *    - Quest definitions (quests table)
 *    - Quest progress (donor_quest_progress table)
 *    - NFT achievements (donor_achievements table)
 *    - Donor levels (donor_levels table)
 *    - Related data: dogs, campaigns (via joins)
 *
 * 2. Escrow/Stellar Blockchain:
 *    - NFT achievements sync (via PodPoap contract) - fallback if not in database
 *    - Escrow contract IDs (stored in transactions.escrow_contract_id and campaigns.escrow_id)
 *
 * 3. Calculated/Transformed Data:
 *    - Total donated amount (sum of transaction.usd_value)
 *    - Donation count (count of transactions)
 *    - Donor level (calculated from stats vs donor_levels requirements)
 *    - Escrow vs Instant breakdown (from transaction.donation_type)
 */

import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DonorProfileClient from "./DonorProfileClient";
import { getNFTAchievements } from "./utils/nft-achievements";
import {
  calculateTotalDonated,
  calculateDonationCount,
  calculateDonorLevel,
} from "./utils/donor-level";
import { transformDonorData, transformDonations } from "./utils/donor-data";
import { getPodPoapContractId } from "./utils/contract-id";

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

  // Fetch all donation transactions from Supabase (includes both instant and escrow)
  // This includes: donation_type (escrow/instant), usd_value, tx_hash, escrow_contract_id, etc.
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
      ),
      campaigns (
        id,
        escrow_id,
        stellar_address
      )
    `
        )
        .eq("donor_id", donor.id)
        .eq("type", "donation")
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

  // Fetch NFT achievements from Supabase (minted NFTs)
  const { data: allAchievements } = donor
    ? await supabase
        .from("donor_achievements")
        .select("*")
        .eq("donor_id", donor.id)
        .order("earned_at", { ascending: false })
    : { data: [] };

  // Get NFT achievements with blockchain sync fallback (Escrow/Stellar blockchain)
  // This syncs NFTs from blockchain if not found in database
  const nftAchievements = await getNFTAchievements(allAchievements, donor?.stellar_address);

  // Debug logging for data sources
  if (donor && allAchievements) {
    console.log("[donor-profile] Donor ID:", donor.id);
    console.log("[donor-profile] Stellar Address:", donor.stellar_address);
    console.log("[donor-profile] Transactions count:", transactions?.length || 0);
    console.log(
      "[donor-profile] Escrow donations:",
      transactions?.filter((t) => t.donation_type === "escrow").length || 0
    );
    console.log(
      "[donor-profile] Instant donations:",
      transactions?.filter((t) => t.donation_type === "instant").length || 0
    );
  }

  const { data: donorLevels } = await supabase
    .from("donor_levels")
    .select("*")
    .order("min_total_donated", { ascending: true });

  // Calculate donor stats from Supabase transactions (includes both escrow and instant donations)
  // Stats are calculated from database transactions, not from blockchain balances
  const totalDonatedAmount = calculateTotalDonated(transactions);
  const donationCount = calculateDonationCount(transactions);

  // Calculate donor level based on stats (from Supabase donor_levels table)
  const currentLevel = calculateDonorLevel(donorLevels, totalDonatedAmount, donationCount);

  // Transform data for client component
  const donorData = transformDonorData(donor, user, totalDonatedAmount);
  const donations = transformDonations(transactions);
  const contractId = getPodPoapContractId();

  return (
    <DonorProfileClient
      donorData={donorData}
      donations={donations}
      quests={quests || []}
      questProgress={questProgress || []}
      donorLevels={donorLevels || []}
      currentLevel={currentLevel}
      nftAchievements={nftAchievements || []}
      contractId={contractId}
    />
  );
}
