import { createClient } from "@/lib/supabase/server";
import type { Dog } from "@/components/donation-story/types";

/**
 * Fetches dog data with related information from Supabase
 */
export async function fetchDogData(dogId: string) {
  const supabase = await createClient();

  const { data: dog, error } = await supabase
    .from("dogs")
    .select(
      `
      *,
      care_provider:care_providers(*),
      campaigns(
        id,
        raised,
        goal,
        spent,
        status,
        headline,
        created_at,
        escrow_id,
        stellar_address,
        funds_needed_for
      ),
      campaign_updates(*),
      campaign_expenses(*)
    `
    )
    .eq("id", dogId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching dog:", {
      message: error?.message || "Unknown error",
      details: error?.details || null,
      hint: error?.hint || null,
      error: error,
    });
    throw error;
  }

  return dog;
}

/**
 * Fetches donation transactions for a dog
 */
export async function fetchDonationTransactions(dogId: string) {
  const supabase = await createClient();

  const { data: donationTransactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("dog_id", dogId)
    .eq("type", "donation")
    .order("created_at", { ascending: false });

  return donationTransactions || [];
}

/**
 * Finds the active campaign from campaigns data
 */
export function findActiveCampaign(campaigns: any) {
  if (Array.isArray(campaigns)) {
    return campaigns.find((c: any) => c.status === "Active") || null;
  }
  return campaigns?.status === "Active" ? campaigns : null;
}

/**
 * Transforms raw dog data from Supabase into the format expected by components
 */
export function transformDogData(dog: any, activeCampaign: any, donationTransactions: any[]): Dog {
  return {
    name: dog.name,
    location: dog.location,
    headline: activeCampaign?.headline || dog.headline,
    images: Array.isArray(dog.images) ? dog.images : [],
    categoryTags: Array.isArray(dog.category_tags) ? dog.category_tags : [],
    currentCondition: dog.current_condition,
    fundsNeededFor: (() => {
      const funds = activeCampaign?.funds_needed_for
        ? Array.isArray(activeCampaign.funds_needed_for)
          ? activeCampaign.funds_needed_for
          : []
        : Array.isArray(dog.funds_needed_for)
          ? dog.funds_needed_for
          : [];
      // Normalize to match Dog type: Array<{ icon: string; label: string }>
      return funds.map((item: any) =>
        typeof item === "string" ? { icon: item, label: item } : item
      );
    })(),
    story: dog.story,
    raised: activeCampaign ? Number(activeCampaign.raised) || 0 : 0,
    goal: activeCampaign ? Number(activeCampaign.goal) || 0 : 0,
    spent: activeCampaign ? Number(activeCampaign.spent) || 0 : 0,
    confirmation: dog.confirmation,
    campaignId: activeCampaign?.id,
    campaignStellarAddress: activeCampaign?.stellar_address || undefined,
    careProvider: dog.care_provider
      ? {
          id: dog.care_provider.id,
          name: dog.care_provider.name,
          type: dog.care_provider.type,
          location: dog.care_provider.location,
          image: dog.care_provider.profile_photo || dog.care_provider.image,
          rating: Number(dog.care_provider.rating) || 0,
          about: dog.care_provider.about,
          description: dog.care_provider.description,
          email: dog.care_provider.email,
          phone: dog.care_provider.phone,
          website: dog.care_provider.website,
        }
      : undefined,
    updates:
      dog.campaign_updates?.map((update: any) => ({
        id: update.id,
        title: update.title,
        date: new Date(update.created_at).toLocaleDateString(),
        description: update.content,
        image: update.image,
      })) || [],
    transactions:
      donationTransactions?.map((tx: any) => ({
        date: new Date(tx.created_at).toLocaleDateString(),
        cryptoAmount: tx.crypto_amount,
        tokenSymbol: tx.token_symbol,
        usdValue: Number(tx.usd_value) || 0,
        donor: tx.donor_address,
        txHash: tx.tx_hash,
        explorerUrl: tx.explorer_url,
        donation_type: tx.donation_type,
      })) || [],
    expenses:
      dog.campaign_expenses?.map((expense: any) => ({
        id: expense.id,
        title: expense.title,
        description: expense.description,
        amount: Number(expense.amount) || 0,
        date: new Date(expense.created_at).toLocaleDateString(),
        proof: expense.proof,
      })) || [],
  };
}
