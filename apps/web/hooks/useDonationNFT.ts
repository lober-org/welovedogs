"use client";

import { useCallback, useState } from "react";
import { useWalletsKit } from "./useWalletsKit";
import { toast } from "sonner";

export type MintNFTResult = {
  hash: string;
  tokenId: number | null;
  tokenUri: string;
};

export function useDonationNFT() {
  const { address } = useWalletsKit();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mintNFTForDonation = useCallback(
    async (donorId: string, transactionId: string): Promise<MintNFTResult> => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      setIsLoading(true);
      setError(null);
      const toastId = toast.loading("Minting your NFT...", {
        description: "Creating your Proof of Donation NFT",
      });

      try {
        const response = await fetch("/api/nft/mint-for-donation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            donorId,
            transactionId,
            donorAddress: address,
          }),
        });

        const result = await response.json();

        if (!result.ok) {
          throw new Error(result.error || "Failed to mint NFT");
        }

        toast.success("NFT minted successfully!", {
          id: toastId,
          description: `Your Proof of Donation NFT has been minted`,
          duration: 5000,
        });

        return {
          hash: result.hash,
          tokenId: result.tokenId,
          tokenUri: result.tokenUri,
        };
      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : "Failed to mint NFT";
        setError(errorMessage);
        toast.error("Failed to mint NFT", {
          id: toastId,
          description: errorMessage,
        });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [address]
  );

  return {
    mintNFTForDonation,
    isLoading,
    error,
    isConnected: !!address,
  };
}
