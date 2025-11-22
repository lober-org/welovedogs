"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBrowserClient } from "@/lib/supabase/client";
import { getProfileRoute } from "./utils";
import type { Dog, Comment, Update, Transaction } from "./types";
import { ImageGallery } from "./ImageGallery";
import { SharePopover } from "./SharePopover";
import { UpdateCard } from "./UpdateCard";
import { CampaignStatusCard } from "./CampaignStatusCard";
import { CareProviderCard } from "./CareProviderCard";
import { TransactionTable } from "./TransactionTable";
import { ExpenseReport } from "./ExpenseReport";
import { UpdateImageModal } from "./UpdateImageModal";
import { UpdateDialog } from "./UpdateDialog";
import { PaginationControls } from "./PaginationControls";
import { toast } from "sonner";

export function DonationStory({ dog }: { dog: Dog }) {
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedUpdateImage, setSelectedUpdateImage] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState("updates");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 3;

  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});

  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);

  // Escrow and balance state
  const [escrowContractId, setEscrowContractId] = useState<string | null>(null);
  const [campaignStellarAddr, setCampaignStellarAddr] = useState<string | null>(null);

  // Fetch campaign data (escrow_id and stellar_address) from Supabase
  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!dog.campaignId) return;

      try {
        const supabase = createBrowserClient();
        const { data: campaign } = await supabase
          .from("campaigns")
          .select("escrow_id, stellar_address")
          .eq("id", dog.campaignId)
          .maybeSingle();

        if (campaign) {
          if (campaign.stellar_address) {
            setCampaignStellarAddr(campaign.stellar_address);
          }
          if (campaign.escrow_id) {
            setEscrowContractId(campaign.escrow_id);
          }
        }
      } catch (err) {
        console.error("Error fetching campaign data:", err);
      }
    };

    fetchCampaignData();
  }, [dog.campaignId]);

  // Memoize stellar address to prevent unnecessary re-renders
  const stellarAddressToUse = useMemo(() => {
    return campaignStellarAddr || dog.campaignStellarAddress || null;
  }, [campaignStellarAddr, dog.campaignStellarAddress]);

  // Transaction state - only use database transactions which are already filtered to donations
  const [isLoadingTransactions] = useState(false);

  // Use only database transactions (already filtered to donations from server query)
  // dog.transactions is already populated with donations from the server-side query
  const allTransactions = useMemo(() => {
    // dog.transactions is already filtered to donations from the server query
    // Map transactions to include type information
    return (dog.transactions || []).map((tx) => {
      // Check if transaction has donation_type property to determine escrow vs instant
      const txWithType = tx as Transaction & { donation_type?: string };
      const isEscrow = tx.type === "escrow" || txWithType.donation_type === "escrow";

      return {
        ...tx,
        type: (isEscrow ? "escrow" : "instant") as "escrow" | "instant",
      };
    });
  }, [dog.transactions]);

  // Calculate total donations from database transactions (not balances)
  const { totalRaised, totalEscrowDonations, totalInstantDonations } = useMemo(() => {
    let escrowTotal = 0;
    let instantTotal = 0;

    (dog.transactions || []).forEach((tx) => {
      const txWithType = tx as Transaction & { donation_type?: string };
      const isEscrow = tx.type === "escrow" || txWithType.donation_type === "escrow";
      const amount = tx.usdValue || 0;

      if (isEscrow) {
        escrowTotal += amount;
      } else {
        instantTotal += amount;
      }
    });

    return {
      totalRaised: escrowTotal + instantTotal,
      totalEscrowDonations: escrowTotal,
      totalInstantDonations: instantTotal,
    };
  }, [dog.transactions]);

  const sortedTransactions = useMemo(() => {
    return [...allTransactions].sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === "asc" ? a.usdValue - b.usdValue : b.usdValue - a.usdValue;
      }
    });
  }, [allTransactions, sortBy, sortOrder]);

  const toggleSort = (column: "date" | "amount") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  // Load comments from database
  useEffect(() => {
    const loadComments = async () => {
      if (!dog.updates || dog.updates.length === 0) return;

      const updateIds = dog.updates.filter((update) => update.id).map((update) => update.id!);

      if (updateIds.length === 0) return;

      try {
        const supabase = createBrowserClient();
        const { data: commentsData, error } = await supabase
          .from("update_comments")
          .select(
            `
						*,
						donors (
							id,
							first_name,
							last_name
						)
					`
          )
          .in("update_id", updateIds)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error loading comments:", error);
          return;
        }

        // Group comments by update_id and fetch donor badges
        const commentsByUpdate: Record<string, Comment[]> = {};
        const donorIds = new Set<string>();

        // First pass: collect donor IDs
        commentsData?.forEach((comment: any) => {
          if (comment.donor_id) {
            donorIds.add(comment.donor_id);
          }
        });

        // Fetch all donor transactions at once
        const donorTransactionsMap = new Map<string, number>();
        if (donorIds.size > 0) {
          const { data: allTransactions } = await supabase
            .from("transactions")
            .select("donor_id, usd_value")
            .in("donor_id", Array.from(donorIds))
            .eq("type", "donation");

          // Calculate total donations per donor
          allTransactions?.forEach(
            (tx: { donor_id: string; usd_value?: number | string | null }) => {
              const donorId = tx.donor_id;
              const currentTotal = donorTransactionsMap.get(donorId) || 0;
              donorTransactionsMap.set(donorId, currentTotal + Number(tx.usd_value || 0));
            }
          );
        }

        // Second pass: build comments with badges
        commentsData?.forEach((comment: any) => {
          const updateId = comment.update_id;
          if (!commentsByUpdate[updateId]) {
            commentsByUpdate[updateId] = [];
          }

          // Get donor name or use anonymous
          const authorName = comment.donors
            ? `${comment.donors.first_name || ""} ${comment.donors.last_name || ""}`.trim() ||
              "Anonymous Supporter"
            : comment.author_name || "Anonymous Supporter";

          // Calculate badges based on donor's total donations
          let badges = 0;
          if (comment.donor_id) {
            const totalDonated = donorTransactionsMap.get(comment.donor_id) || 0;
            // Calculate badges: 1 badge per $100 donated, max 7 badges
            badges = Math.min(Math.floor(totalDonated / 100), 7);
          }

          commentsByUpdate[updateId].push({
            author: authorName,
            message: comment.message,
            date: new Date(comment.created_at).toLocaleDateString(),
            badges: badges > 0 ? badges : undefined,
          });
        });

        setComments(commentsByUpdate);
      } catch (err) {
        console.error("Error loading comments:", err);
      }
    };

    loadComments();
  }, [dog.updates]);

  const addComment = async (updateId: string) => {
    const message = newComment[updateId]?.trim();
    if (!message || !updateId) return;

    // Validate that updateId is a valid UUID (not a fallback like "update-0")
    // UUIDs have format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(updateId)) {
      toast.error("Cannot comment on this update", {
        description: "This update is not available for commenting",
      });
      return;
    }

    try {
      const supabase = createBrowserClient();

      // Get current user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        toast.error("Please sign in to comment", {
          description: "You need to be signed in to leave a comment",
        });
        return;
      }

      // Get donor information
      const { data: donor } = await supabase
        .from("donors")
        .select("id, first_name, last_name")
        .eq("auth_user_id", authUser.id)
        .maybeSingle();

      // Calculate badges based on donor's total donations
      let badges = 0;
      if (donor) {
        const { data: donorTransactions } = await supabase
          .from("transactions")
          .select("usd_value")
          .eq("donor_id", donor.id)
          .eq("type", "donation");

        const totalDonated =
          donorTransactions?.reduce(
            (sum: number, tx: { usd_value?: number | string | null }) =>
              sum + Number(tx.usd_value || 0),
            0
          ) || 0;

        // Calculate badges: 1 badge per $100 donated, max 7 badges
        badges = Math.min(Math.floor(totalDonated / 100), 7);
      }

      // Save comment to database
      const { data: newCommentData, error } = await supabase
        .from("update_comments")
        .insert({
          update_id: updateId,
          donor_id: donor?.id || null,
          message: message,
          author_name: donor
            ? `${donor.first_name || ""} ${donor.last_name || ""}`.trim() || null
            : null,
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving comment:", error);
        toast.error("Failed to save comment", {
          description: error.message,
        });
        return;
      }

      // Add comment to local state using the database response
      const authorName = donor
        ? `${donor.first_name || ""} ${donor.last_name || ""}`.trim() || "Anonymous Supporter"
        : newCommentData?.author_name || "Anonymous Supporter";

      const comment: Comment = {
        author: authorName,
        message,
        date: newCommentData?.created_at
          ? new Date(newCommentData.created_at).toLocaleDateString()
          : "Just now",
        badges: badges > 0 ? badges : undefined,
      };

      setComments((prev) => ({
        ...prev,
        [updateId]: [...(prev[updateId] || []), comment],
      }));

      setNewComment((prev) => ({
        ...prev,
        [updateId]: "",
      }));

      toast.success("Comment posted!", {
        description: "Your comment has been saved",
      });
    } catch (err) {
      console.error("Error adding comment:", err);
      toast.error("Failed to post comment", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `Help ${dog.name}! ${dog.headline || `Support ${dog.name}'s recovery`}`;

  const scrollToDonation = () => {
    const donationWidget = document.getElementById("donation-widget");
    if (donationWidget) {
      donationWidget.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const updates = dog.updates || [];
  const totalPages = Math.ceil(updates.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentUpdates = updates.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleUpdateImageClick = (image: string, update: Update) => {
    setSelectedUpdateImage(image);
    setSelectedUpdate(update);
  };

  const renderTabContent = (tab: string, variant: "desktop" | "mobile" = "desktop") => {
    switch (tab) {
      case "updates":
        return (
          <>
            <h2 className="font-sans text-xl font-bold text-foreground md:text-2xl lg:text-3xl">
              {dog.name}&apos;s Feed
            </h2>
            {updates.length > 0 ? (
              <>
                <div className="space-y-4 md:space-y-6">
                  {currentUpdates.map((update, index) => {
                    const updateId = update.id || `update-${startIndex + index}`;
                    return (
                      <UpdateCard
                        key={updateId}
                        update={update}
                        updateId={updateId}
                        comments={comments[updateId] || []}
                        newComment={newComment[updateId] || ""}
                        onCommentChange={(value) =>
                          setNewComment((prev) => ({
                            ...prev,
                            [updateId]: value,
                          }))
                        }
                        onAddComment={() => addComment(updateId)}
                        onImageClick={handleUpdateImageClick}
                      />
                    );
                  })}
                </div>
                {totalPages > 1 && (
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPrevious={goToPreviousPage}
                    onNext={goToNextPage}
                    variant={variant}
                  />
                )}
              </>
            ) : (
              <div className="rounded-lg border-2 border-muted bg-muted/30 p-12 text-center">
                <p className="text-lg font-medium text-muted-foreground mb-2">No updates yet</p>
                <p className="text-sm text-muted-foreground">
                  The care provider will post updates about {dog.name}'s progress here. Check back
                  soon!
                </p>
              </div>
            )}
          </>
        );
      case "campaign":
        return (
          <>
            <h2 className="font-sans text-xl font-bold text-foreground md:text-2xl lg:text-3xl">
              Active Campaign
            </h2>
            <CampaignStatusCard
              dog={dog}
              totalRaised={totalRaised}
              escrowDonations={totalEscrowDonations}
              instantDonations={totalInstantDonations}
              isLoadingDonations={false}
              escrowContractId={escrowContractId}
              stellarAddressToUse={stellarAddressToUse}
            />
          </>
        );
      case "journey":
        return (
          <>
            <h2 className="font-sans text-xl font-bold text-foreground md:text-2xl lg:text-3xl">
              {dog.name}'s Story
            </h2>
            <div className="space-y-3 text-pretty text-sm leading-relaxed text-foreground/90 md:space-y-4 md:text-base">
              {dog.story.split("\n\n").map((paragraph, index) => (
                <p key={`story-${index}-${paragraph.substring(0, 20)}`}>{paragraph}</p>
              ))}
            </div>
          </>
        );
      case "careprovider":
        return dog.careProvider ? (
          <>
            <h2 className="font-sans text-xl font-bold text-foreground md:text-2xl lg:text-3xl">
              About the Care Provider
            </h2>
            <CareProviderCard careProvider={dog.careProvider} variant={variant} />
          </>
        ) : null;
      case "expenses":
        return (
          <>
            <h2 className="font-sans text-xl font-bold text-foreground md:text-2xl lg:text-3xl">
              Expense Report
            </h2>
            <ExpenseReport expenses={dog.expenses || []} />
          </>
        );
      case "transparency":
        return (
          <>
            <div className="flex items-center justify-between">
              <h3 className="font-sans text-lg font-bold text-foreground md:text-xl">
                Transaction History
              </h3>
              {isLoadingTransactions && (
                <span className="text-xs text-muted-foreground">Loading...</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground md:text-sm">
              All crypto donations are recorded on the blockchain for complete transparency. Click
              the link icon to view the full transaction.
            </p>
            <TransactionTable
              transactions={sortedTransactions}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={toggleSort}
              isLoading={isLoadingTransactions}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Header */}
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2 md:mb-3 md:gap-3">
          <h1 className="font-sans text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            {dog.name}
          </h1>
          {dog.careProvider && (
            <>
              <span className="hidden text-2xl text-muted-foreground md:inline">·</span>
              <Link
                href={
                  `/profile/${getProfileRoute(dog.careProvider.type)}/${dog.careProvider.id}` as Route
                }
                className="flex items-center gap-2 transition-opacity hover:opacity-80"
              >
                <span className="text-base text-muted-foreground md:text-lg">rescued by</span>
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border-2 border-primary md:h-12 md:w-12">
                  <Image
                    src={dog.careProvider.image || "/placeholder.svg"}
                    alt={dog.careProvider.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold leading-tight text-foreground hover:underline md:text-base">
                    {dog.careProvider.name}
                  </span>
                </div>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Image Gallery and Headline */}
      <div className="grid gap-3 md:grid-cols-2 md:gap-4 md:items-stretch">
        <ImageGallery images={dog.images} alt={dog.name} />
        {dog.headline && (
          <div className="relative flex flex-col items-center justify-center rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-6 md:p-8 shadow-sm">
            <SharePopover shareUrl={shareUrl} shareText={shareText} />
            <h2 className="font-sans text-2xl font-bold leading-tight text-foreground md:text-3xl lg:text-4xl text-balance text-center">
              {dog.headline}
            </h2>
            <div className="mt-4 flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm md:text-base">{dog.location}</span>
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={scrollToDonation}
        className="w-full md:hidden bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-bold py-6"
      >
        Donate Now
      </Button>

      {/* Desktop Tabs */}
      <Tabs defaultValue="campaign" className="w-full hidden md:block">
        <TabsList className="mb-4 w-full justify-start overflow-x-auto overflow-y-hidden bg-muted/50 p-1.5 md:mb-6 flex md:grid md:grid-cols-6 gap-2">
          <TabsTrigger
            value="updates"
            className="whitespace-nowrap shrink-0 px-6 relative data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            {dog.name}&apos;s Feed
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {updates.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="campaign"
            className="whitespace-nowrap shrink-0 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Campaign
          </TabsTrigger>
          <TabsTrigger
            value="journey"
            className="whitespace-nowrap shrink-0 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Journey
          </TabsTrigger>
          <TabsTrigger
            value="careprovider"
            className="whitespace-nowrap shrink-0 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Care Provider
          </TabsTrigger>
          <TabsTrigger
            value="expenses"
            className="whitespace-nowrap shrink-0 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Expense Report
          </TabsTrigger>
          <TabsTrigger
            value="transparency"
            className="whitespace-nowrap shrink-0 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Donations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaign" className="space-y-3 md:space-y-4">
          {renderTabContent("campaign")}
        </TabsContent>
        <TabsContent value="updates" className="space-y-3 md:space-y-4">
          {renderTabContent("updates")}
        </TabsContent>
        <TabsContent value="journey" className="space-y-3 md:space-y-4">
          {renderTabContent("journey")}
        </TabsContent>
        <TabsContent value="careprovider" className="space-y-4 md:space-y-6">
          {renderTabContent("careprovider")}
        </TabsContent>
        <TabsContent value="expenses" className="space-y-3 md:space-y-4">
          {renderTabContent("expenses")}
        </TabsContent>
        <TabsContent value="transparency" className="space-y-3 md:space-y-4">
          {renderTabContent("transparency")}
        </TabsContent>
      </Tabs>

      {/* Mobile Tabs */}
      <div className="md:hidden">
        <Select value={mobileTab} onValueChange={setMobileTab}>
          <SelectTrigger className="w-full h-14 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 text-lg font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="campaign" className="text-base py-3">
              Campaign
            </SelectItem>
            <SelectItem value="updates" className="text-base py-3">
              {dog.name}&apos;s Feed ({updates.length})
            </SelectItem>
            <SelectItem value="journey" className="text-base py-3">
              Journey
            </SelectItem>
            <SelectItem value="careprovider" className="text-base py-3">
              Care Provider
            </SelectItem>
            <SelectItem value="expenses" className="text-base py-3">
              Expense Report
            </SelectItem>
            <SelectItem value="transparency" className="text-base py-3">
              Donations
            </SelectItem>
          </SelectContent>
        </Select>

        <div className="mt-4">
          <div className="rounded-lg bg-gradient-to-br from-purple-50 via-purple-50/50 to-white p-6 border border-purple-200/50 shadow-sm space-y-3 md:space-y-4">
            {renderTabContent(mobileTab, "mobile")}
          </div>
        </div>
      </div>

      {/* Modals */}
      <UpdateImageModal image={selectedUpdateImage} onClose={() => setSelectedUpdateImage(null)} />
      <UpdateDialog update={selectedUpdate} onClose={() => setSelectedUpdate(null)} />
    </div>
  );
}
