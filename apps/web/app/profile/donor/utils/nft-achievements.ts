import type { Database } from "@/lib/supabase/types";

type Achievement = Database["public"]["Tables"]["donor_achievements"]["Row"];

export interface NFTAchievement {
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

/**
 * Filters achievements that have been minted as NFTs
 */
export function filterNFTAchievements(achievements: Achievement[] | null): NFTAchievement[] {
  if (!achievements) return [];

  return achievements
    .filter((achievement) => {
      const isMinted =
        achievement.nft_minted === true ||
        achievement.nft_minted === "true" ||
        String(achievement.nft_minted).toLowerCase() === "true";
      const hasTokenId =
        achievement.nft_token_id !== null &&
        achievement.nft_token_id !== undefined &&
        String(achievement.nft_token_id).trim() !== "";

      return isMinted && hasTokenId;
    })
    .map((achievement) => ({
      id: achievement.id,
      nft_token_id: String(achievement.nft_token_id),
      blockchain_tx_hash: achievement.blockchain_tx_hash || undefined,
      metadata: achievement.metadata as Record<string, unknown> | undefined,
      earned_at: achievement.earned_at,
    }));
}

/**
 * Syncs NFT achievements from blockchain if not found in database
 */
export async function syncNFTsFromBlockchain(
  stellarAddress: string,
  allAchievements: Achievement[]
): Promise<NFTAchievement[]> {
  try {
    const { createPodPoapClient } = await import("@/lib/contracts/podPoap");
    const client = await createPodPoapClient();
    const balanceTx = await client.balance({ account: stellarAddress });
    const balance = Number(balanceTx.result ?? 0);

    if (balance === 0) {
      return [];
    }

    console.log(
      `[donor-profile] Found ${balance} NFT(s) on blockchain for ${stellarAddress}, syncing...`
    );

    // Fetch all token IDs from blockchain
    const blockchainTokens = [];
    for (let index = 0; index < balance; index += 1) {
      try {
        const tokenTx = await client.get_owner_token_id({
          owner: stellarAddress,
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
    if (blockchainTokens.length > 0 && allAchievements.length > 0) {
      const syntheticAchievements: NFTAchievement[] = blockchainTokens.map((token, index) => {
        const matchingAchievement = allAchievements[index] || allAchievements[0];
        const existingMetadata = matchingAchievement?.metadata as
          | Record<string, unknown>
          | undefined;
        const existingMetadataIpfsUrl = existingMetadata?.metadataIpfsUrl;
        return {
          id: matchingAchievement?.id || `blockchain-${token.nft_token_id}`,
          nft_token_id: token.nft_token_id,
          blockchain_tx_hash: matchingAchievement?.blockchain_tx_hash || undefined,
          metadata: {
            ...(existingMetadata as NFTAchievement["metadata"] | undefined),
            metadataIpfsUrl: (token.tokenUri ||
              (typeof existingMetadataIpfsUrl === "string"
                ? existingMetadataIpfsUrl
                : undefined)) as string | undefined,
          },
          earned_at: matchingAchievement?.earned_at || new Date().toISOString(),
        };
      });

      console.log(
        `[donor-profile] Created ${syntheticAchievements.length} synthetic NFT achievements from blockchain`
      );

      return syntheticAchievements;
    }

    return [];
  } catch (blockchainError) {
    console.error("[donor-profile] Error querying blockchain for NFTs:", blockchainError);
    return [];
  }
}

/**
 * Gets NFT achievements, with fallback to blockchain sync if needed
 */
export async function getNFTAchievements(
  allAchievements: Achievement[] | null,
  stellarAddress?: string | null
): Promise<NFTAchievement[]> {
  if (!allAchievements) return [];

  // Filter achievements from database
  let nftAchievements = filterNFTAchievements(allAchievements);

  // Debug logging
  if (allAchievements.length > 0) {
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
  if (nftAchievements.length === 0 && stellarAddress) {
    nftAchievements = await syncNFTsFromBlockchain(stellarAddress, allAchievements);
  }

  return nftAchievements;
}
