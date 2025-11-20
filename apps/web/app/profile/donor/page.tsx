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

  // Fetch NFT achievements (minted NFTs)
  // Query all achievements for this donor, then filter for those with NFTs
  const { data: allAchievements } = donor
    ? await supabase
        .from("donor_achievements")
        .select("*")
        .eq("donor_id", donor.id)
        .order("earned_at", { ascending: false })
    : { data: [] };

  // Filter for achievements that have been minted as NFTs
  // Handle both boolean true and string "true" cases
  let nftAchievements =
    allAchievements?.filter((achievement) => {
      const isMinted =
        achievement.nft_minted === true ||
        achievement.nft_minted === "true" ||
        String(achievement.nft_minted).toLowerCase() === "true";
      const hasTokenId =
        achievement.nft_token_id !== null &&
        achievement.nft_token_id !== undefined &&
        String(achievement.nft_token_id).trim() !== "";
      return isMinted && hasTokenId;
    }) || [];

  // Debug logging
  if (donor && allAchievements) {
    console.log("[donor-profile] Donor ID:", donor.id);
    console.log("[donor-profile] Stellar Address:", donor.stellar_address);
    console.log("[donor-profile] All achievements:", allAchievements.length);
    console.log("[donor-profile] NFT achievements (from DB):", nftAchievements.length);
    if (allAchievements.length > 0) {
      console.log(
        "[donor-profile] First achievement:",
        JSON.stringify(
          {
            id: allAchievements[0].id,
            nft_minted: allAchievements[0].nft_minted,
            nft_token_id: allAchievements[0].nft_token_id,
            nft_minted_type: typeof allAchievements[0].nft_minted,
            nft_token_id_type: typeof allAchievements[0].nft_token_id,
          },
          null,
          2
        )
      );
    }
  }

  // Fallback: If no NFTs found in DB but donor has stellar address, try querying blockchain
  // This handles cases where the NFT was minted but DB wasn't updated
  if (nftAchievements.length === 0 && donor?.stellar_address) {
    try {
      const { createPodPoapClient } = await import("@/lib/contracts/podPoap");
      const client = await createPodPoapClient();
      const balanceTx = await client.balance({ account: donor.stellar_address });
      const balance = Number(balanceTx.result ?? 0);

      if (balance > 0) {
        console.log(
          `[donor-profile] Found ${balance} NFT(s) on blockchain for ${donor.stellar_address}, syncing...`
        );

        // Fetch all token IDs from blockchain
        const blockchainTokens = [];
        for (let index = 0; index < balance; index += 1) {
          try {
            const tokenTx = await client.get_owner_token_id({
              owner: donor.stellar_address,
              index,
            });
            const tokenId = Number(tokenTx.result ?? 0);

            let tokenUri: string | null = null;
            try {
              const uriTx = await client.token_uri({ token_id: tokenId });
              tokenUri = (uriTx.result as string) ?? null;
            } catch {
              // Token URI might not be set yet
            }

            blockchainTokens.push({
              nft_token_id: tokenId.toString(),
              tokenUri,
            });
          } catch (error) {
            console.error(`[donor-profile] Error fetching token ${index}:`, error);
          }
        }

        // Create synthetic achievement records from blockchain data
        // Match them with existing achievements by quest if possible
        if (blockchainTokens.length > 0 && allAchievements && allAchievements.length > 0) {
          nftAchievements = blockchainTokens.map((token, index) => {
            // Try to match with an existing achievement
            const matchingAchievement = allAchievements[index] || allAchievements[0];
            return {
              id: matchingAchievement?.id || `blockchain-${token.nft_token_id}`,
              nft_token_id: token.nft_token_id,
              blockchain_tx_hash: matchingAchievement?.blockchain_tx_hash,
              metadata: {
                ...matchingAchievement?.metadata,
                metadataIpfsUrl: token.tokenUri || matchingAchievement?.metadata?.metadataIpfsUrl,
              },
              earned_at: matchingAchievement?.earned_at || new Date().toISOString(),
            };
          });
          console.log(
            `[donor-profile] Created ${nftAchievements.length} synthetic NFT achievements from blockchain`
          );
        }
      }
    } catch (blockchainError) {
      console.error("[donor-profile] Error querying blockchain for NFTs:", blockchainError);
      // Continue with empty array if blockchain query fails
    }
  }

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

  // Get contract ID from environment or bindings
  const contractId =
    process.env.POD_POAP_CONTRACT_ID ||
    process.env.NEXT_PUBLIC_POD_POAP_CONTRACT_ID ||
    "CB6L7W2OTD5LPTC5TOLFPLHTQXAYSHIB4DWA5UNI6PYJ53PW6LYDK3AE"; // Fallback to deployed contract

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
