"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Heart, Shield, Zap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEscrow } from "@/hooks/useEscrow";
import { useDonation } from "@/hooks/useDonation";
import { useWalletsKit } from "@/hooks/useWalletsKit";
import { useStellarAccount } from "@/hooks/useStellarAccount";
import { createBrowserClient } from "@/lib/supabase/client";
import { useGetMultipleEscrowBalances } from "@trustless-work/escrow/hooks";
import { toast } from "sonner";
import type { DonationWidgetProps } from "@/lib/types/donation-widget";
import { getIconEmoji } from "@/lib/utils/fund-icons";

export function StickyDonationWidget({
  dogName,
  raised: _raised, // Legacy prop - replaced by fetched balances
  spent,
  fundsNeededFor,
  campaignId,
  careProviderAddress: _careProviderAddress, // Reserved for future use
  campaignStellarAddress,
  goal: _goal, // Reserved for future use
}: DonationWidgetProps) {
  const router = useRouter();
  const { address, openModalAndConnect } = useWalletsKit();
  const {
    fundCampaignEscrow,
    getEscrowDetails,
    isLoading: escrowLoading,
    error: escrowError,
  } = useEscrow();
  const { donate, isLoading: donationLoading, error: donationError } = useDonation();
  const { getMultipleBalances } = useGetMultipleEscrowBalances();

  const [selectedAmount, setSelectedAmount] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [donationType, setDonationType] = useState<"escrow" | "instant">("escrow");
  const [error, setError] = useState<string | null>(null);
  const [escrowContractId, setEscrowContractId] = useState<string | null>(null);
  const [escrowBalance, setEscrowBalance] = useState<number>(0);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [campaignStellarAddr, setCampaignStellarAddr] = useState<string | null>(null);
  const [dogId, setDogId] = useState<string | null>(null);

  // Store functions in refs to prevent re-renders while keeping them up-to-date
  const getMultipleBalancesRef = useRef(getMultipleBalances);
  const getEscrowDetailsRef = useRef(getEscrowDetails);

  // Update refs when functions change (they should be stable from hooks)
  useEffect(() => {
    getMultipleBalancesRef.current = getMultipleBalances;
    getEscrowDetailsRef.current = getEscrowDetails;
  }, [getMultipleBalances, getEscrowDetails]);

  // Fetch campaign data (escrow_id, stellar_address, and dog_id) from Supabase
  // Only fetch once when campaignId changes
  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!campaignId) return;

      try {
        const supabase = createBrowserClient();
        const { data: campaign } = await supabase
          .from("campaigns")
          .select("escrow_id, stellar_address, dog_id")
          .eq("id", campaignId)
          .maybeSingle();

        if (campaign) {
          // Set campaign stellar address (for instant donations and balance fetching)
          if (campaign.stellar_address) {
            setCampaignStellarAddr(campaign.stellar_address);
          }

          // Fetch escrow data if escrow exists
          if (campaign.escrow_id) {
            setEscrowContractId(campaign.escrow_id);
          }

          // Set dog ID for donation tracking
          if (campaign.dog_id) {
            setDogId(campaign.dog_id);
          }
        }
      } catch (err) {
        console.error("Error fetching campaign data:", err);
      }
    };

    fetchCampaignData();
  }, [campaignId]);

  // Fetch escrow balance separately - only when escrowContractId changes
  useEffect(() => {
    const fetchEscrowBalance = async () => {
      if (!escrowContractId) {
        setEscrowBalance(0);
        return;
      }

      setIsLoadingBalances(true);
      try {
        const balances = await getMultipleBalancesRef.current({
          addresses: [escrowContractId],
        });

        // Handle array response
        if (Array.isArray(balances) && balances.length > 0) {
          const balanceData = balances[0];
          if (balanceData && "balance" in balanceData && typeof balanceData.balance === "number") {
            setEscrowBalance(balanceData.balance);
          }
        }
      } catch (balanceError) {
        console.error("Error fetching escrow balance:", balanceError);
        // Try to get balance from escrow details
        try {
          const escrowDetails = await getEscrowDetailsRef.current([escrowContractId]);
          const escrow = Array.isArray(escrowDetails) ? escrowDetails[0] : escrowDetails;
          if (escrow && "balance" in escrow && typeof escrow.balance === "number") {
            setEscrowBalance(escrow.balance);
          }
        } catch (detailsError) {
          console.error("Error fetching escrow details for balance:", detailsError);
        }
      } finally {
        setIsLoadingBalances(false);
      }
    };

    fetchEscrowBalance();
  }, [escrowContractId]);

  // Memoize stellar address to prevent unnecessary re-renders
  const stellarAddressToUse = useMemo(() => {
    return campaignStellarAddr || campaignStellarAddress || null;
  }, [campaignStellarAddr, campaignStellarAddress]);

  // Fetch campaign wallet balance from the campaign's stellar_address
  const {
    lumensBalance: campaignWalletBalance,
    isLoading: campaignBalanceLoading,
    refresh: refreshCampaignBalance,
  } = useStellarAccount(stellarAddressToUse);

  // Set default donation type based on escrow availability
  useEffect(() => {
    if (escrowContractId) {
      setDonationType("escrow"); // Default to escrow if available
    } else {
      setDonationType("instant"); // Only instant if no escrow
    }
  }, [escrowContractId]);

  // Refresh balances after successful donation
  // Memoize to prevent unnecessary re-creations
  const refreshBalances = useCallback(async () => {
    // Refresh escrow balance if escrow exists
    if (escrowContractId) {
      try {
        setIsLoadingBalances(true);
        const balances = await getMultipleBalancesRef.current({
          addresses: [escrowContractId],
        });

        if (Array.isArray(balances) && balances.length > 0) {
          const balanceData = balances[0];
          if (balanceData && "balance" in balanceData && typeof balanceData.balance === "number") {
            setEscrowBalance(balanceData.balance);
          }
        }
      } catch (balanceError) {
        console.error("Error refreshing escrow balance:", balanceError);
      } finally {
        setIsLoadingBalances(false);
      }
    }

    // Refresh campaign wallet balance
    if (stellarAddressToUse && refreshCampaignBalance) {
      try {
        await refreshCampaignBalance();
      } catch (error) {
        console.error("Error refreshing campaign wallet balance:", error);
      }
    }
  }, [escrowContractId, stellarAddressToUse, refreshCampaignBalance]);

  const handleDonate = async () => {
    const amount = selectedAmount || Number.parseFloat(customAmount);
    if (!amount || amount <= 0) {
      toast.error("Invalid amount", {
        description: "Please enter a valid donation amount",
      });
      setError("Please enter a valid donation amount");
      return;
    }

    // Check wallet connection
    if (!address) {
      toast.error("Wallet not connected", {
        description: "Please connect your wallet to make a donation",
      });
      setError("Please connect your wallet to donate");
      await openModalAndConnect();
      return;
    }

    setIsProcessing(true);
    setError(null);

    const toastId = toast.loading("Processing donation...", {
      description: "Please wait while we process your donation",
    });

    try {
      if (donationType === "escrow") {
        // Escrow donation flow
        if (!campaignId) {
          throw new Error("Campaign ID is required for escrow donations");
        }

        if (!escrowContractId) {
          throw new Error(
            "No escrow account found for this campaign. Please contact the campaign organizer."
          );
        }

        toast.loading("Funding escrow...", {
          id: toastId,
          description: "Sending your donation to the escrow account",
        });

        // Fund the escrow
        const fundResult = await fundCampaignEscrow(escrowContractId, amount);

        if (!fundResult.successful) {
          throw new Error("Failed to fund escrow");
        }

        toast.success("Donation successful!", {
          id: toastId,
          description: `Your $${amount} donation has been sent to the escrow account`,
          duration: 5000,
        });

        // Refresh balances before navigating
        await refreshBalances();

        // Pass both dogId (if available) and campaignId (as fallback for fetching dogId)
        const dogIdParam = dogId ? `&dogId=${encodeURIComponent(dogId)}` : "";
        const campaignIdParam = campaignId ? `&campaignId=${encodeURIComponent(campaignId)}` : "";
        const donorAddressParam = address ? `&donorAddress=${encodeURIComponent(address)}` : "";
        router.push(
          `/donation-success?dog=${encodeURIComponent(dogName)}&amount=${amount}&type=escrow&contractId=${escrowContractId}&hash=${fundResult.hash || ""}${dogIdParam}${campaignIdParam}${donorAddressParam}`
        );
      } else {
        // Instant donation flow
        const stellarAddr = campaignStellarAddr || campaignStellarAddress;
        if (!stellarAddr) {
          throw new Error(
            "Campaign stellar address is required for instant donations. Please contact the campaign organizer."
          );
        }

        toast.loading("Sending donation...", {
          id: toastId,
          description: "Processing your instant donation",
        });

        // Create a short memo (max 28 bytes for Stellar)
        // Use campaign ID if available, otherwise truncate dog name
        const maxMemoLength = 28;
        let memo = "";
        if (campaignId) {
          // Use first 8 chars of campaign ID: "aa5389ca"
          memo = campaignId.substring(0, 8);
        } else if (dogName) {
          // Truncate dog name to fit
          memo = dogName.substring(0, maxMemoLength);
        }

        const donationResult = await donate(stellarAddr, amount.toString(), memo || undefined);

        if (!donationResult.successful) {
          throw new Error("Donation failed");
        }

        toast.success("Donation successful!", {
          id: toastId,
          description: `Your $${amount} donation has been sent`,
          duration: 5000,
        });

        // Refresh campaign wallet balance before navigating
        if (stellarAddressToUse && refreshCampaignBalance) {
          try {
            await refreshCampaignBalance();
          } catch (error) {
            console.error("Error refreshing campaign wallet balance:", error);
          }
        }

        // Pass both dogId (if available) and campaignId (as fallback for fetching dogId)
        const dogIdParam = dogId ? `&dogId=${encodeURIComponent(dogId)}` : "";
        const campaignIdParam = campaignId ? `&campaignId=${encodeURIComponent(campaignId)}` : "";
        const donorAddressParam = address ? `&donorAddress=${encodeURIComponent(address)}` : "";
        router.push(
          `/donation-success?dog=${encodeURIComponent(dogName)}&amount=${amount}&type=instant&hash=${donationResult.hash || ""}${dogIdParam}${campaignIdParam}${donorAddressParam}`
        );
      }
    } catch (err: unknown) {
      console.error("Donation error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process donation. Please try again.";

      toast.error("Donation failed", {
        id: toastId,
        description: errorMessage,
      });

      setError(errorMessage);
      setIsProcessing(false);
    }
  };

  const isLoading = isProcessing || escrowLoading || donationLoading;
  const displayError = error || escrowError?.message || donationError?.message;

  // Calculate total raised (escrow balance + campaign wallet balance)
  const totalRaised = escrowBalance + (Number.parseFloat(campaignWalletBalance) || 0);
  const instantRaised = Number.parseFloat(campaignWalletBalance) || 0;

  const donationAmounts = [25, 50, 100];

  const normalizedFunds = Array.isArray(fundsNeededFor)
    ? fundsNeededFor.map((item) => (typeof item === "string" ? { icon: item, label: item } : item))
    : [];

  return (
    <div className="w-full sticky top-20 h-fit" id="donation-widget">
      <div
        className="rounded-2xl p-3 md:p-4 shadow-2xl border-2 border-purple-300"
        style={{
          backgroundImage: "url('/purple-paw-background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Goal Section */}
        <h2 className="mb-3 md:mb-4 font-sans text-lg md:text-xl font-bold text-white">
          Support {dogName}
        </h2>

        {/* Amount Raised */}
        <div className="mb-3 md:mb-4">
          <div className="mb-1.5 flex items-end justify-between">
            <span className="font-sans text-xs md:text-sm font-semibold text-white">
              Amount Raised
            </span>
            <span className="font-sans text-xl md:text-2xl font-bold text-white">
              $
              {isLoadingBalances || campaignBalanceLoading
                ? "..."
                : totalRaised.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
            </span>
          </div>
          {escrowContractId ? (
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center justify-between text-[10px] md:text-xs text-white/80">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Escrow:
                </span>
                <span className="font-medium">
                  $
                  {isLoadingBalances
                    ? "..."
                    : escrowBalance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] md:text-xs text-white/80">
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Instant:
                </span>
                <span className="font-medium">
                  $
                  {campaignBalanceLoading
                    ? "..."
                    : instantRaised.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                </span>
              </div>
            </div>
          ) : stellarAddressToUse ? (
            <div className="mt-1.5 flex items-center justify-between text-[10px] md:text-xs text-white/80">
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Instant Donations:
              </span>
              <span className="font-medium">
                $
                {campaignBalanceLoading
                  ? "..."
                  : instantRaised.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
              </span>
            </div>
          ) : null}
        </div>

        {/* Spent Progress */}
        <div className="mb-3 md:mb-4">
          <div className="mb-1.5 flex items-end justify-between">
            <span className="font-sans text-xs md:text-sm font-semibold text-white">
              Amount Spent on Care
            </span>
            <span className="font-sans text-xl md:text-2xl font-bold text-white">
              ${spent.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Donation Type - Only show if escrow exists */}
        {escrowContractId && (
          <div className="mb-3 md:mb-4 rounded-xl bg-white/95 p-2.5 md:p-3">
            <h3 className="mb-2 font-sans text-xs md:text-sm font-bold text-gray-900">
              Donation Type
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDonationType("escrow")}
                className={`rounded-lg border-2 p-2.5 transition-all ${
                  donationType === "escrow"
                    ? "border-purple-600 bg-purple-600 text-white shadow-md"
                    : "border-purple-200 bg-white text-gray-700 hover:border-purple-400 hover:bg-purple-50"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Shield className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="font-sans text-xs md:text-sm font-semibold">Escrow</span>
                </div>
                <p className="font-sans text-[9px] md:text-[10px] leading-tight opacity-90">
                  Funds released after proof of expense
                </p>
              </button>
              <button
                type="button"
                onClick={() => setDonationType("instant")}
                className={`rounded-lg border-2 p-2.5 transition-all ${
                  donationType === "instant"
                    ? "border-purple-600 bg-purple-600 text-white shadow-md"
                    : "border-purple-200 bg-white text-gray-700 hover:border-purple-400 hover:bg-purple-50"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Zap className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="font-sans text-xs md:text-sm font-semibold">Instant</span>
                </div>
                <p className="font-sans text-[9px] md:text-[10px] leading-tight opacity-90">
                  Immediate access to funds
                </p>
              </button>
            </div>
          </div>
        )}

        {normalizedFunds.length > 0 && (
          <div className="mb-3 md:mb-4 rounded-xl bg-white/95 p-2.5 md:p-3">
            <h3 className="mb-2 font-sans text-xs md:text-sm font-bold text-gray-900">
              How Your Donation Helps {dogName}
            </h3>
            <div className="space-y-1.5">
              {normalizedFunds.map((item) => (
                <div
                  key={`${item.icon}-${item.label}`}
                  className="flex items-center gap-2 rounded-lg bg-purple-50 px-2 py-1.5"
                >
                  <div className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-purple-600 shrink-0">
                    <span className="text-xs md:text-sm">{getIconEmoji(item.icon)}</span>
                  </div>
                  <span className="font-sans text-[10px] md:text-xs font-medium text-gray-800 leading-tight">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Select Donation Amount */}
        <div className="mb-2.5 md:mb-3 rounded-xl bg-white/95 p-2 md:p-2.5">
          <h3 className="mb-1.5 font-sans text-[10px] md:text-xs font-bold text-gray-900">
            Select Donation Amount
          </h3>
          <div className="mb-2 md:mb-2.5 grid grid-cols-3 gap-1.5">
            {donationAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount("");
                }}
                className={`rounded-lg border-2 py-1.5 font-sans text-xs font-semibold transition-all ${
                  selectedAmount === amount
                    ? "border-purple-600 bg-purple-600 text-white shadow-md"
                    : "border-purple-300 bg-white text-purple-700 hover:border-purple-500 hover:bg-purple-50"
                }`}
              >
                ${amount}
              </button>
            ))}
          </div>

          <div>
            <label
              htmlFor="custom-amount-input"
              className="mb-1 block font-sans text-[10px] md:text-xs font-medium text-gray-700"
            >
              Or enter custom amount
            </label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 font-sans text-xs text-gray-500">
                $
              </span>
              <input
                id="custom-amount-input"
                type="number"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                placeholder="0.00"
                className="w-full rounded-lg border-2 border-purple-300 bg-white py-1.5 pl-5 md:pl-6 pr-2 font-sans text-xs text-gray-900 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/20"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className="mb-2 md:mb-3 rounded-lg bg-red-50 border border-red-200 p-2.5 md:p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <p className="font-sans text-xs text-red-800 leading-tight">{displayError}</p>
            </div>
          </div>
        )}

        {/* Wallet Connection Status */}
        {!address && (
          <div className="mb-2 md:mb-3 rounded-lg bg-yellow-50 border border-yellow-200 p-2.5 md:p-3">
            <p className="font-sans text-xs text-yellow-800 leading-tight">
              Please connect your wallet to make a donation
            </p>
          </div>
        )}

        {/* Donate Button */}
        <Button
          onClick={handleDonate}
          disabled={isLoading || (!selectedAmount && !customAmount) || !address}
          className="mb-2 md:mb-3 w-full rounded-lg bg-purple-600 py-3 md:py-4 font-sans text-sm md:text-base font-bold text-white shadow-lg transition-all hover:bg-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-label="Loading">
                <title>Loading spinner</title>
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Heart className="h-4 w-4 fill-current" />
              DONATE NOW
            </span>
          )}
        </Button>

        {/* Security Message */}
        <p className="mb-1.5 md:mb-2 text-center font-sans text-[9px] md:text-[10px] text-white/90 leading-tight">
          Your donation is secure and tax-deductible. 100% goes directly to {dogName}'s care.
        </p>

        {/* Transparency Footer */}
        <div className="flex items-center justify-center gap-1.5 rounded-lg bg-white/20 px-2 py-1.5">
          <svg
            className="h-3 w-3 md:h-3.5 md:w-3.5 text-white shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-label="Security shield icon"
          >
            <title>Security shield</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span className="font-sans text-[9px] md:text-[10px] text-white leading-tight">
            Live transparency powered by Stellar
          </span>
        </div>
      </div>
    </div>
  );
}
