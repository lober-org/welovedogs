"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Share2, Lock, Sparkles, Heart, Trophy, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { updateQuestProgress } from "@/app/actions/update-quest-progress";
import { toast } from "sonner";
import { useDonationNFT } from "@/hooks/useDonationNFT";

function DonationSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dogName = searchParams.get("dog") || searchParams.get("dogName") || "this dog";
  const amount = searchParams.get("amount") || "0";
  const donationType = searchParams.get("type") || "instant";
  const txHash = searchParams.get("hash") || "";
  const contractId = searchParams.get("contractId") || "";
  const dogId = searchParams.get("dogId") || "";
  const donorAddress = searchParams.get("donorAddress") || "";
  const campaignId = searchParams.get("campaignId") || "";

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [donorId, setDonorId] = useState<string | null>(null);
  const [collectibleClaimed, setCollectibleClaimed] = useState(false);
  const [donationRecorded, setDonationRecorded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [questProgress, setQuestProgress] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoadingQuests, setIsLoadingQuests] = useState(false);
  const [totalDonated, setTotalDonated] = useState(0);
  const [dogsSupported, setDogsSupported] = useState(0);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [nftMinted, setNftMinted] = useState(false);
  const [nftTokenId, setNftTokenId] = useState<number | null>(null);

  const { mintNFTForDonation, isLoading: isMintingNFT } = useDonationNFT();

  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareText = `I just donated $${amount} to help ${dogName}! Join me in making a difference.`;

  const handleShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);

    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
    }
  };

  const handleClaimCollectible = () => {
    setCollectibleClaimed(true);
    console.log("Collectible claimed for donation to:", dogName);
  };

  const handleSignUpToClaim = () => {
    router.push(`/register/donor?from=donation-success&dogName=${dogName}&amount=${amount}`);
  };

  // Check authentication and get donor ID
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setIsAuthenticated(true);
        setEmail(user.email || "");

        // Get donor ID
        const { data: donor } = await supabase
          .from("donors")
          .select("id")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (donor) {
          setDonorId(donor.id);
        }
      }
    };

    checkAuth();
  }, []);

  // Fetch dogId from campaignId if not provided
  const [finalDogId, setFinalDogId] = useState(dogId);
  const [isFetchingDogId, setIsFetchingDogId] = useState(false);

  useEffect(() => {
    const fetchDogId = async () => {
      // If we already have dogId, don't fetch
      if (finalDogId) {
        return;
      }

      // Try to get dogId from campaignId if available
      if (campaignId && !isFetchingDogId) {
        setIsFetchingDogId(true);
        try {
          const supabase = createBrowserClient();
          const { data: campaign, error } = await supabase
            .from("campaigns")
            .select("dog_id")
            .eq("id", campaignId)
            .maybeSingle();

          if (error) {
            console.error("Error fetching campaign dog_id:", error);
          } else if (campaign?.dog_id) {
            setFinalDogId(campaign.dog_id);
          }
        } catch (err) {
          console.error("Error in fetchDogId:", err);
        } finally {
          setIsFetchingDogId(false);
        }
      }
    };

    fetchDogId();
  }, [campaignId, finalDogId, isFetchingDogId]);

  // Record donation and update quest progress
  useEffect(() => {
    const recordDonation = async () => {
      // We can record donations even without donorId (for guest donations)
      // But we need at least dogId and txHash
      if (!finalDogId || !txHash || donationRecorded || isRecording || isFetchingDogId) {
        // Log why we're not recording
        if (!finalDogId) {
          console.log("Waiting for dogId...", { dogId, campaignId, finalDogId, isFetchingDogId });
        }
        return;
      }

      setIsRecording(true);
      const toastId = toast.loading("Recording your donation...");

      try {
        console.log("Recording donation:", {
          donorId,
          dogId: finalDogId,
          campaignId,
          txHash,
          amount,
          donationType,
          contractId,
          donorAddress,
        });

        // Record the donation
        const recordResponse = await fetch("/api/donation/record", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            donorId: donorId || undefined, // Optional - API will fetch from auth if not provided
            dogId: finalDogId,
            campaignId: campaignId || undefined,
            txHash,
            amount: parseFloat(amount),
            donationType: donationType as "escrow" | "instant",
            contractId: contractId || undefined,
            donorAddress: donorAddress || undefined, // Pass the donor's wallet address
          }),
        });

        const recordResult = await recordResponse.json();

        console.log("Donation record result:", recordResult);

        if (!recordResult.ok) {
          throw new Error(recordResult.error || "Failed to record donation");
        }

        setDonationRecorded(true);
        setTransactionId(recordResult.transactionId);

        // The API route already updates quest progress, so we just fetch the updated data
        // Try to get donorId from response, state, or by looking up the transaction
        let updatedDonorId = recordResult.donorId || donorId;

        // If still no donorId, try to find it from the transaction or donor address
        if (!updatedDonorId && recordResult.transactionId) {
          const supabase = createBrowserClient();

          // Try to get donorId from the transaction record
          const { data: transaction } = await supabase
            .from("transactions")
            .select("donor_id")
            .eq("id", recordResult.transactionId)
            .maybeSingle();

          if (transaction?.donor_id) {
            updatedDonorId = transaction.donor_id;
            setDonorId(transaction.donor_id);
          } else if (donorAddress) {
            // Try to find donor by stellar_address
            const { data: donorByAddress } = await supabase
              .from("donors")
              .select("id")
              .eq("stellar_address", donorAddress)
              .maybeSingle();

            if (donorByAddress?.id) {
              updatedDonorId = donorByAddress.id;
              setDonorId(donorByAddress.id);
            }
          }
        }

        if (updatedDonorId) {
          // Wait for the transaction to be fully recorded and quest progress to update
          // Increased delay to ensure escrow donations are fully processed
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const supabase = createBrowserClient();

          // Retry mechanism to ensure transaction is recorded
          let transactions = null;
          let retries = 0;
          const maxRetries = 3;

          while (retries < maxRetries) {
            // Check if the current donation transaction exists
            if (recordResult.transactionId) {
              const { data: currentTx } = await supabase
                .from("transactions")
                .select("id")
                .eq("id", recordResult.transactionId)
                .maybeSingle();

              if (currentTx) {
                // Transaction exists, now fetch all transactions for stats
                const { data: txData, error: txError } = await supabase
                  .from("transactions")
                  .select("usd_value, dog_id")
                  .eq("donor_id", updatedDonorId)
                  .eq("type", "donation");

                if (!txError && txData) {
                  transactions = txData;
                  break;
                }
              }
            } else {
              // No transactionId, just fetch all transactions
              const { data: txData, error: txError } = await supabase
                .from("transactions")
                .select("usd_value, dog_id")
                .eq("donor_id", updatedDonorId)
                .eq("type", "donation");

              if (txError) {
                console.error("[donation-success] Error fetching transactions:", txError);
              }

              if (txData && txData.length > 0) {
                transactions = txData;
                break;
              }
            }

            if (retries < maxRetries - 1) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
            retries++;
          }

          // Fetch updated quest progress and achievements
          const { data: progress } = await supabase
            .from("donor_quest_progress")
            .select(
              `
            *,
            quests (
              id,
              name,
              description,
              icon,
              requirement_type,
              requirement_value,
              points
            )
          `
            )
            .eq("donor_id", updatedDonorId);

          const { data: achievementsData } = await supabase
            .from("donor_achievements")
            .select(
              `
            *,
            quests (
              id,
              name,
              description,
              icon,
              points
            )
          `
            )
            .eq("donor_id", updatedDonorId)
            .order("earned_at", { ascending: false });

          // Always calculate stats from transactions to get the most up-to-date data
          // This ensures escrow donations are included immediately after recording
          if (transactions && transactions.length > 0) {
            const calculatedTotal = transactions.reduce(
              (sum: number, tx: { usd_value: number | null; dog_id: string | null }) =>
                sum + Number(tx.usd_value || 0),
              0
            );
            const calculatedDogs = new Set(
              transactions
                .map((tx: { usd_value: number | null; dog_id: string | null }) => tx.dog_id)
                .filter(Boolean)
            ).size;

            setTotalDonated(calculatedTotal);
            setDogsSupported(calculatedDogs);

            console.log("[donation-success] Updated stats from transactions:", {
              totalDonated: calculatedTotal,
              dogsSupported: calculatedDogs,
              transactionCount: transactions.length,
              retries,
            });
          } else {
            // Fallback to donor table if no transactions found yet
            const { data: donor } = await supabase
              .from("donors")
              .select("total_donations, dogs_supported")
              .eq("id", updatedDonorId)
              .maybeSingle();

            if (donor) {
              setTotalDonated(donor.total_donations || 0);
              setDogsSupported(donor.dogs_supported || 0);
              console.log(
                "[donation-success] Using donor table stats (transactions not found yet):",
                {
                  totalDonated: donor.total_donations,
                  dogsSupported: donor.dogs_supported,
                }
              );
            }
          }

          setQuestProgress(progress || []);
          setAchievements(achievementsData || []);
        } else {
          // Even without donorId, try to calculate stats from transactions using donorAddress
          // Wait a bit for transaction to be recorded
          await new Promise((resolve) => setTimeout(resolve, 2000));

          if (donorAddress) {
            const supabase = createBrowserClient();
            const { data: transactions } = await supabase
              .from("transactions")
              .select("usd_value, dog_id")
              .eq("donor_address", donorAddress)
              .eq("type", "donation");

            if (transactions && transactions.length > 0) {
              const calculatedTotal = transactions.reduce(
                (sum: number, tx: { usd_value: number | null; dog_id: string | null }) =>
                  sum + Number(tx.usd_value || 0),
                0
              );
              const calculatedDogs = new Set(
                transactions
                  .map((tx: { usd_value: number | null; dog_id: string | null }) => tx.dog_id)
                  .filter(Boolean)
              ).size;

              setTotalDonated(calculatedTotal);
              setDogsSupported(calculatedDogs);

              console.log("[donation-success] Updated stats from donorAddress:", {
                totalDonated: calculatedTotal,
                dogsSupported: calculatedDogs,
                transactionCount: transactions.length,
                donorAddress,
              });
            }
          }
        }

        toast.success("Donation recorded!", {
          id: toastId,
          description: "Your donation has been tracked and quest progress updated",
        });
      } catch (error: any) {
        console.error("Error recording donation:", error);
        toast.error("Failed to record donation", {
          id: toastId,
          description: error.message || "Please contact support if this persists",
        });
      } finally {
        setIsRecording(false);
      }
    };

    recordDonation();
  }, [
    donorId,
    finalDogId,
    txHash,
    amount,
    donationType,
    contractId,
    donorAddress,
    campaignId,
    donationRecorded,
    isRecording,
    isFetchingDogId,
    dogId,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex flex-col md:grid md:gap-0 md:grid-cols-[1fr_380px]">
              {/* Left - Thank You Image */}
              <div className="flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 p-8 md:p-8">
                <Image
                  src="/images/welove-thanks.svg"
                  alt="Thank you for your donation"
                  width={400}
                  height={400}
                  className="h-auto w-full max-w-sm"
                />
              </div>

              {/* Right - Collectible and Share */}
              <div className="flex flex-col justify-start space-y-4 border-t md:border-t-0 md:border-l bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-6">
                {/* Collectible Section - Top */}
                {!isAuthenticated ? (
                  <div className="rounded-2xl border-2 border-purple-300 bg-white p-4 shadow-lg">
                    <div className="flex flex-col items-center gap-3">
                      {/* Collectible Preview */}
                      <div className="relative flex-shrink-0">
                        <div className="relative h-24 w-24">
                          <Image
                            src="/placeholder.svg"
                            alt="Collectible badge"
                            width={96}
                            height={96}
                            className="rounded-2xl opacity-30 blur-md"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="rounded-full bg-purple-600 p-2 shadow-lg">
                              <Lock className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        </div>
                        <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                      </div>

                      {/* Emotional CTA Content */}
                      <div className="space-y-2 text-center">
                        <h2 className="font-sans text-lg font-bold text-foreground">
                          You've Unlocked Something Special!
                        </h2>
                        <div className="text-left text-xs text-muted-foreground">
                          <p className="mb-2 text-center font-medium">
                            Create your free account to:
                          </p>
                          <ul className="space-y-1 text-left">
                            <li className="flex items-start gap-2">
                              <span className="mt-0.5 text-purple-600">•</span>
                              <span>Claim your exclusive WeLoveDogs collectible</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-0.5 text-purple-600">•</span>
                              <span>Get updates on {dogName}'s recovery</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-0.5 text-purple-600">•</span>
                              <span>See the difference your support makes</span>
                            </li>
                          </ul>
                        </div>
                        <Button
                          size="sm"
                          onClick={handleSignUpToClaim}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-sm font-semibold text-white shadow-lg hover:from-purple-700 hover:to-pink-700"
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          Create Free Account & Claim
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Donation Stats */}
                    {donationRecorded && (
                      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Donation Recorded!
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-center p-2 bg-white rounded-lg">
                              <p className="text-xs text-gray-600">Total Donated</p>
                              <p className="text-lg font-bold text-gray-800">
                                ${totalDonated.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-center p-2 bg-white rounded-lg">
                              <p className="text-xs text-gray-600">Dogs Supported</p>
                              <p className="text-lg font-bold text-gray-800">{dogsSupported}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Quest Progress */}
                    {questProgress.length > 0 && (
                      <Card className="border-2 border-purple-300 bg-white">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-purple-600" />
                            Quest Progress
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Track your achievements and unlock badges
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-48 overflow-y-auto">
                          {questProgress.slice(0, 3).map((progress: any) => {
                            const quest = progress.quests;
                            if (!quest) return null;
                            const percentage = Math.min(
                              (progress.current_progress / quest.requirement_value) * 100,
                              100
                            );
                            return (
                              <div
                                key={progress.id}
                                className="p-2 bg-purple-50 rounded-lg border border-purple-200"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-semibold text-gray-800">
                                    {quest.icon} {quest.name}
                                  </span>
                                  {progress.is_completed && (
                                    <Badge className="bg-green-500 text-white text-xs">
                                      Completed
                                    </Badge>
                                  )}
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                                  <div
                                    className={`h-1.5 rounded-full ${
                                      progress.is_completed ? "bg-green-500" : "bg-purple-500"
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <p className="text-xs text-gray-600">
                                  {progress.current_progress} / {quest.requirement_value}
                                </p>
                              </div>
                            );
                          })}
                          {questProgress.length > 3 && (
                            <Link href="/profile/donor">
                              <Button variant="ghost" size="sm" className="w-full text-xs">
                                View All Quests ({questProgress.length})
                              </Button>
                            </Link>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Achievements/Badges */}
                    {achievements.length > 0 && (
                      <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-yellow-600" />
                            Your Badges
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Achievements you've unlocked
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {achievements.slice(0, 4).map((achievement: any) => {
                              const quest = achievement.quests;
                              if (!quest) return null;
                              return (
                                <div
                                  key={achievement.id}
                                  className="flex flex-col items-center p-2 bg-white rounded-lg border border-yellow-200"
                                >
                                  <div className="text-2xl mb-1">{quest.icon}</div>
                                  <p className="text-xs font-semibold text-center text-gray-800">
                                    {quest.name}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                          {achievements.length > 4 && (
                            <Link href="/profile/donor">
                              <Button variant="ghost" size="sm" className="w-full mt-2 text-xs">
                                View All Badges ({achievements.length})
                              </Button>
                            </Link>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Loading State */}
                    {isRecording && (
                      <Card className="border-2 border-blue-300 bg-blue-50">
                        <CardContent className="p-4 text-center">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                          <p className="text-sm text-blue-800">Recording your donation...</p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Mint NFT Section */}
                    {donationRecorded && donorId && transactionId && !nftMinted && (
                      <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                            Claim Your NFT Badge
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Mint a commemorative Proof of Donation NFT for your contribution
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button
                            size="sm"
                            onClick={async () => {
                              if (!donorId || !transactionId) return;
                              try {
                                const result = await mintNFTForDonation(donorId, transactionId);
                                setNftMinted(true);
                                setNftTokenId(result.tokenId);
                                toast.success("NFT minted!", {
                                  description: "Your Proof of Donation NFT is ready",
                                });
                              } catch (error) {
                                console.error("Failed to mint NFT:", error);
                              }
                            }}
                            disabled={isMintingNFT}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-sm font-semibold text-white hover:from-purple-700 hover:to-pink-700"
                          >
                            {isMintingNFT ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Minting NFT...
                              </>
                            ) : (
                              <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Mint Proof of Donation NFT
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    )}

                    {/* NFT Minted Success */}
                    {nftMinted && nftTokenId !== null && (
                      <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            NFT Minted Successfully!
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-700 mb-2">
                            Your Proof of Donation NFT #{nftTokenId} has been minted and added to
                            your wallet.
                          </p>
                          <Link href="/profile/donor">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-green-300 text-green-700 hover:bg-green-100"
                            >
                              View My NFTs
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    )}

                    {/* View Profile CTA */}
                    {donationRecorded && (
                      <Link href="/profile/donor">
                        <Button
                          size="sm"
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-sm font-semibold text-white hover:from-purple-700 hover:to-pink-700"
                        >
                          <Trophy className="mr-2 h-4 w-4" />
                          View My Profile & Quests
                        </Button>
                      </Link>
                    )}
                  </div>
                )}

                {/* Share the Love Section - Bottom */}
                <div className="rounded-2xl border-2 border-purple-300 bg-white p-4 shadow-lg">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Share2 className="h-5 w-5 text-purple-600" />
                      <h2 className="font-sans text-base font-bold text-foreground">
                        Share the Love
                      </h2>
                    </div>
                    <p className="text-pretty text-xs text-muted-foreground">
                      Help us spread awareness and encourage others to support rescue dogs in need.
                    </p>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-purple-200 bg-white text-xs hover:bg-purple-50"
                        onClick={() => handleShare("facebook")}
                      >
                        <svg className="mr-2 h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Share on Facebook
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-purple-200 bg-white text-xs hover:bg-purple-50"
                        onClick={() => handleShare("twitter")}
                      >
                        <svg className="mr-2 h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                        Share on Twitter
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Thank You Message */}
            <div className="space-y-3 border-t bg-gradient-to-r from-purple-50 to-pink-50 p-4 text-center md:p-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600">
                <Heart className="h-7 w-7 fill-white text-white" />
              </div>
              <h1 className="font-sans text-2xl font-bold text-foreground md:text-3xl lg:text-4xl">
                Thank You for Your Generosity!
              </h1>
              <p className="text-pretty text-base text-muted-foreground md:text-lg">
                Your ${amount} donation will make a real difference in {dogName}'s life. Together,
                we're giving hope and healing.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 p-4 sm:flex-row md:p-6">
              <Link href="/" className="flex-1">
                <Button variant="default" size="lg" className="w-full">
                  Return Home
                </Button>
              </Link>
              <Link href="/#dogs" className="flex-1">
                <Button variant="outline" size="lg" className="w-full bg-transparent">
                  Help Another Dog
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DonationSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
        </div>
      }
    >
      <DonationSuccessContent />
    </Suspense>
  );
}
