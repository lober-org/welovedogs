import type { User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type Donor = Database["public"]["Tables"]["donors"]["Row"];
type Transaction = Database["public"]["Tables"]["transactions"]["Row"] & {
  dogs?: {
    id: string;
    name: string;
    images: string[] | null;
  } | null;
  campaigns?: {
    id: string;
    escrow_id: string | null;
    stellar_address: string | null;
  } | null;
};

export interface DonorData {
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

export interface DonationData {
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

/**
 * Transforms donor database record to DonorData format
 */
export function transformDonorData(
  donor: Donor | null,
  user: User,
  totalDonatedAmount: number
): DonorData {
  if (donor) {
    return {
      id: donor.id,
      firstName: donor.first_name,
      lastName: donor.last_name,
      email: donor.email,
      country: donor.country || "",
      phone: donor.phone || undefined,
      profilePicture: donor.profile_picture || undefined,
      stellarAddress: donor.stellar_address || undefined,
      memberSince: donor.member_since || donor.created_at,
      totalDonations: totalDonatedAmount,
      dogsSupported: donor.dogs_supported || 0,
    };
  }

  // Fallback for users without donor profile
  return {
    id: user.id,
    firstName: user.email?.split("@")[0] || "Anonymous",
    lastName: "Donor",
    email: user.email || "",
    country: "United States",
    memberSince: user.created_at,
    totalDonations: 0,
    dogsSupported: 0,
  };
}

/**
 * Transforms transaction records to DonationData format
 * Includes donation type (escrow/instant) and escrow contract info
 */
export function transformDonations(transactions: Transaction[] | null): DonationData[] {
  if (!transactions) return [];

  return transactions.map((tx) => ({
    id: tx.id,
    dogName: tx.dogs?.name || "Unknown",
    dogImage: tx.dogs?.images?.[0] || "/placeholder.svg",
    amount: Number(tx.usd_value || 0),
    date: tx.created_at,
    transactionHash: tx.tx_hash || "",
    donationType: tx.donation_type as "escrow" | "instant" | undefined,
    escrowContractId: tx.escrow_contract_id || tx.campaigns?.escrow_id || null,
    campaignId: tx.campaign_id || tx.campaigns?.id || null,
  }));
}
