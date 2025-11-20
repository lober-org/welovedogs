"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ExternalLink, ImageIcon, Sparkles } from "lucide-react";
import Link from "next/link";
import type { TokenMetadata } from "@/components/NFT/types";

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

interface DonorNFTGalleryProps {
  nftAchievements: NFTAchievement[];
  contractId?: string;
}

export default function DonorNFTGallery({ nftAchievements, contractId }: DonorNFTGalleryProps) {
  const [tokenMetadata, setTokenMetadata] = useState<Record<string, TokenMetadata | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (nftAchievements.length === 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadMetadata() {
      setLoading(true);
      try {
        const entries = await Promise.all(
          nftAchievements.map(async (achievement) => {
            const metadataUrl = achievement.metadata?.metadataIpfsUrl;
            if (!metadataUrl) {
              return [achievement.nft_token_id, null] as const;
            }

            try {
              // Handle IPFS URLs
              const url = metadataUrl.startsWith("ipfs://")
                ? `https://gateway.pinata.cloud/ipfs/${metadataUrl.replace("ipfs://", "")}`
                : metadataUrl;

              const response = await fetch(url);
              if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
              }
              const data = (await response.json()) as TokenMetadata;
              return [achievement.nft_token_id, data] as const;
            } catch (error) {
              console.error(
                `Failed to load metadata for token #${achievement.nft_token_id}:`,
                error
              );
              return [achievement.nft_token_id, null] as const;
            }
          })
        );

        if (!cancelled) {
          setTokenMetadata(Object.fromEntries(entries));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMetadata();

    return () => {
      cancelled = true;
    };
  }, [nftAchievements]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="relative mx-auto mb-4 w-16 h-16">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
          <div
            className="absolute inset-2 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          ></div>
        </div>
        <p className="text-gray-600 animate-pulse">Loading your NFTs...</p>
      </div>
    );
  }

  if (nftAchievements.length === 0) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="relative inline-block mb-4">
          <ImageIcon className="h-16 w-16 mx-auto text-gray-300 animate-bounce" />
          <div className="absolute inset-0 bg-purple-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
        </div>
        <p className="text-lg font-semibold text-gray-700 mb-2">No NFTs minted yet</p>
        <p className="text-sm text-gray-600 mb-4">
          Mint your first Proof of Donation NFT after making a donation!
        </p>
        <Link href="/donate">
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 hover:shadow-lg animate-pulse">
            Browse Dogs in Need
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {nftAchievements.map((achievement, index) => {
        const metadata = tokenMetadata[achievement.nft_token_id];
        const tokenId = parseInt(achievement.nft_token_id, 10);
        const imageUrl = metadata?.image
          ? metadata.image.startsWith("ipfs://")
            ? `https://gateway.pinata.cloud/ipfs/${metadata.image.replace("ipfs://", "")}`
            : metadata.image
          : achievement.metadata?.imageIpfsUrl
            ? achievement.metadata.imageIpfsUrl.startsWith("ipfs://")
              ? `https://gateway.pinata.cloud/ipfs/${achievement.metadata.imageIpfsUrl.replace("ipfs://", "")}`
              : achievement.metadata.imageIpfsUrl
            : null;

        const series = metadata?.attributes?.find((attr) => attr.trait_type === "Series")?.value;
        const donationAmount = metadata?.attributes?.find(
          (attr) => attr.trait_type === "Donation Amount"
        )?.value;
        const dogName = metadata?.attributes?.find((attr) => attr.trait_type === "Dog")?.value;

        const explorerUrl = contractId
          ? `https://stellar.expert/explorer/testnet/contract/${contractId}#token-${tokenId}`
          : null;

        return (
          <Card
            key={achievement.id}
            className="group relative overflow-hidden border-2 border-purple-200/50 bg-gradient-to-br from-purple-50 via-white to-pink-50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4 animate-float"
            style={{
              animationDelay: `${index * 150}ms`,
              animationFillMode: "both",
              animationDuration: "3s",
            }}
          >
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 via-pink-400/0 to-blue-400/0 group-hover:from-purple-400/10 group-hover:via-pink-400/10 group-hover:to-blue-400/10 transition-all duration-700"></div>

            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            {/* Floating sparkles */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
            </div>

            <div className="relative p-6 z-10">
              <div className="flex flex-col items-center text-center">
                {/* NFT Image with animated border */}
                <div className="relative mb-4 h-48 w-48 rounded-full overflow-hidden border-4 border-white shadow-2xl group-hover:shadow-purple-500/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                  {/* Glow effect */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500 animate-pulse"></div>

                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={metadata?.name || `POD #${tokenId}`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 animate-gradient">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}

                  {/* Shine overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                {/* Token ID Badge with pulse */}
                <div className="absolute top-4 right-4 z-20">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 text-xs font-bold text-white shadow-lg animate-pulse group-hover:animate-none group-hover:scale-110 transition-transform duration-300">
                    #{tokenId}
                  </span>
                </div>

                {/* Series Badge with glow */}
                {series && (
                  <div className="absolute top-4 left-4 z-20">
                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-3 py-1 text-xs font-semibold text-white shadow-lg group-hover:shadow-pink-500/50 transition-all duration-300 group-hover:scale-110">
                      {series}
                    </span>
                  </div>
                )}

                {/* NFT Info */}
                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-purple-700 transition-colors duration-300">
                  {metadata?.name || `Proof of Donation #${tokenId}`}
                </h3>
                {metadata?.description && (
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
                    {metadata.description}
                  </p>
                )}

                {/* Attributes with hover effects */}
                <div className="w-full space-y-2 mb-4">
                  {dogName && (
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 group-hover:bg-gray-100 transition-all duration-300 group-hover:shadow-md transform group-hover:scale-105">
                      <span className="text-xs font-medium text-gray-600">Dog</span>
                      <span className="text-xs font-bold text-gray-800">{dogName}</span>
                    </div>
                  )}
                  {donationAmount && (
                    <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 group-hover:from-green-100 group-hover:to-emerald-100 transition-all duration-300 group-hover:shadow-md transform group-hover:scale-105">
                      <span className="text-xs font-medium text-gray-600">Amount</span>
                      <span className="text-xs font-bold text-green-700">{donationAmount}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons with enhanced hover */}
                <div className="flex flex-wrap gap-2 w-full">
                  {explorerUrl && (
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-xs font-semibold text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50"
                    >
                      <ExternalLink className="h-3 w-3 group-hover:rotate-12 transition-transform duration-300" />
                      View on Explorer
                    </a>
                  )}
                  {achievement.blockchain_tx_hash && (
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${achievement.blockchain_tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border-2 border-purple-300 px-4 py-2 text-xs font-semibold text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300 transform hover:scale-105"
                    >
                      <ExternalLink className="h-3 w-3 group-hover:rotate-12 transition-transform duration-300" />
                      Transaction
                    </a>
                  )}
                </div>

                {/* Earned Date with subtle animation */}
                <p className="text-xs text-gray-500 mt-3 group-hover:text-gray-600 transition-colors duration-300">
                  Earned {new Date(achievement.earned_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
