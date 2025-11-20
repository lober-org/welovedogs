"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
  MapPin,
  Share2,
  MessageCircle,
  Send,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Dog {
  name: string;
  location: string;
  images: string[];
  categoryTags: string[];
  currentCondition: string;
  headline?: string;
  fundsNeededFor: Array<{ icon: string; label: string }>;
  story: string;
  confirmation: string;
  careProvider?: {
    id: number;
    name: string;
    type: string;
    location: string;
    image: string;
    rating?: number;
    description?: string;
    about?: string; // Added 'about' field
    email?: string;
    phone?: string;
    website?: string;
  };
  updates?: Array<{
    title: string;
    date: string;
    description: string;
    image: string;
  }>;
  transactions?: Array<{
    date: string;
    cryptoAmount: string;
    tokenSymbol: string;
    usdValue: number;
    donor: string;
    txHash: string;
    explorerUrl: string;
  }>;
  expenses?: Array<{
    id: string;
    title: string;
    description: string;
    amount: number;
    date: string;
    proof?: string;
  }>;
  raised: number;
  goal: number;
  spent?: number;
}

interface Comment {
  author: string;
  message: string;
  date: string;
  badges?: number; // Number of badges earned
}

export function DonationStory({ dog }: { dog: Dog }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedUpdateImage, setSelectedUpdateImage] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState("updates");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 3;

  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [newComment, setNewComment] = useState<Record<number, string>>({});
  const [showAllComments, setShowAllComments] = useState<Record<number, boolean>>({});

  // New state for selected update details
  const [selectedUpdate, setSelectedUpdate] = useState<{
    title: string;
    date: string;
    description: string;
    image: string;
  } | null>(null);

  const getProfileRoute = (type: string) => {
    const normalizedType = type.toLowerCase();
    if (normalizedType === "veterinarian") return "veterinary";
    return normalizedType;
  };

  const addComment = (updateIndex: number) => {
    const message = newComment[updateIndex]?.trim();
    if (!message) return;

    const comment: Comment = {
      author: "Anonymous Supporter",
      message,
      date: "Just now",
      badges: Math.floor(Math.random() * 7), // 0-6 badges
    };

    setComments((prev) => ({
      ...prev,
      [updateIndex]: [...(prev[updateIndex] || []), comment],
    }));

    setNewComment((prev) => ({
      ...prev,
      [updateIndex]: "",
    }));
  };

  const toggleShowAll = (updateIndex: number) => {
    setShowAllComments((prev) => ({
      ...prev,
      [updateIndex]: !prev[updateIndex],
    }));
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % dog.images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + dog.images.length) % dog.images.length);
  };

  const iconMap: Record<string, string> = {
    Surgery: "🏥",
    Medication: "💊",
    Therapy: "🩺",
    Food: "🍖",
    Tests: "🔬",
    ICU: "⚕️",
    Rehabilitation: "♿",
    Treatment: "💉",
    Extraction: "🦷",
    Care: "❤️",
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const sortedTransactions = dog.transactions
    ? [...dog.transactions].sort((a, b) => {
        if (sortBy === "date") {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        } else {
          return sortOrder === "asc" ? a.usdValue - b.usdValue : b.usdValue - a.usdValue;
        }
      })
    : [];

  const toggleSort = (column: "date" | "amount") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `Help ${dog.name}! ${dog.headline || `Support ${dog.name}'s recovery`}`;

  const handleShare = (platform: "whatsapp" | "twitter" | "instagram") => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);

    switch (platform) {
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, "_blank");
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
          "_blank"
        );
        break;
      case "instagram":
        navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        alert("Link copied to clipboard! Open Instagram and paste it in your story or post.");
        break;
    }
    setShareOpen(false);
  };

  const scrollToDonation = () => {
    const donationWidget = document.getElementById("donation-widget");
    if (donationWidget) {
      donationWidget.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const renderUpdateCard = (
    update: { title: string; date: string; description: string; image: string },
    index: number
  ) => {
    const updateComments = comments[index] || [];
    const showAll = showAllComments[index] || false;
    const visibleComments = showAll ? updateComments : updateComments.slice(-3);
    const hasMoreComments = updateComments.length > 3;

    return (
      <div
        key={index}
        className="overflow-hidden rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm"
      >
        <div className="p-4 md:p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-[200px_1fr]">
            <div
              className="relative aspect-video w-full cursor-pointer overflow-hidden rounded-md md:aspect-square md:h-[200px] md:w-[200px] hover:opacity-90 transition-opacity"
              onClick={() => {
                setSelectedUpdateImage(update.image);
                setSelectedUpdate(update);
              }}
            >
              <Image
                src={update.image || "/placeholder.svg"}
                alt={update.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex flex-col space-y-3">
              <div>
                <div className="mb-2 flex items-start justify-between gap-4">
                  <h3 className="font-sans text-lg font-bold text-foreground md:text-xl">
                    {update.title}
                  </h3>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {update.date}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90 md:text-base">
                  {update.description}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-primary/20 pt-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <MessageCircle className="h-4 w-4" />
              <span className="font-semibold">
                {updateComments.length} {updateComments.length === 1 ? "Comment" : "Comments"}
              </span>
            </div>

            {visibleComments.length > 0 && (
              <div className="space-y-2">
                {visibleComments.map((comment, commentIndex) => (
                  <div key={commentIndex} className="rounded-lg bg-background/60 p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {comment.author}
                        </span>
                        {comment.badges !== undefined && comment.badges > 0 && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="relative flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 transition-all hover:scale-110 shadow-sm">
                                <Award className="h-3 w-3 text-white" />
                                {comment.badges > 1 && (
                                  <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-purple-600 text-[8px] font-bold text-white">
                                    {comment.badges}
                                  </span>
                                )}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72 p-4" align="start">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 border-b pb-2">
                                  <Award className="h-5 w-5 text-amber-500" />
                                  <h4 className="font-bold text-foreground">Donor Badges</h4>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  {comment.badges >= 1 && (
                                    <div className="flex flex-col items-center gap-1 rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 p-2">
                                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-md">
                                        🎯
                                      </div>
                                      <span className="text-[10px] font-medium text-center leading-tight">
                                        First Donation
                                      </span>
                                    </div>
                                  )}
                                  {comment.badges >= 2 && (
                                    <div className="flex flex-col items-center gap-1 rounded-lg border bg-gradient-to-br from-blue-50 to-cyan-50 p-2">
                                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-md">
                                        💝
                                      </div>
                                      <span className="text-[10px] font-medium text-center leading-tight">
                                        Generous Supporter
                                      </span>
                                    </div>
                                  )}
                                  {comment.badges >= 3 && (
                                    <div className="flex flex-col items-center gap-1 rounded-lg border bg-gradient-to-br from-purple-50 to-pink-50 p-2">
                                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-500 text-white shadow-md">
                                        🔄
                                      </div>
                                      <span className="text-[10px] font-medium text-center leading-tight">
                                        Consistent Helper
                                      </span>
                                    </div>
                                  )}
                                  {comment.badges >= 4 && (
                                    <div className="flex flex-col items-center gap-1 rounded-lg border bg-gradient-to-br from-orange-50 to-amber-50 p-2">
                                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-md">
                                        🌱
                                      </div>
                                      <span className="text-[10px] font-medium text-center leading-tight">
                                        Growing Supporter
                                      </span>
                                    </div>
                                  )}
                                  {comment.badges >= 5 && (
                                    <div className="flex flex-col items-center gap-1 rounded-lg border bg-gradient-to-br from-red-50 to-rose-50 p-2">
                                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-rose-500 text-white shadow-md">
                                        💖
                                      </div>
                                      <span className="text-[10px] font-medium text-center leading-tight">
                                        Big-Hearted Donor
                                      </span>
                                    </div>
                                  )}
                                  {comment.badges >= 6 && (
                                    <div className="flex flex-col items-center gap-1 rounded-lg border bg-gradient-to-br from-indigo-50 to-violet-50 p-2">
                                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white shadow-md">
                                        ⭐
                                      </div>
                                      <span className="text-[10px] font-medium text-center leading-tight">
                                        Steady Contributor
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{comment.date}</span>
                    </div>
                    <p className="text-sm text-foreground/90">{comment.message}</p>
                  </div>
                ))}
              </div>
            )}

            {hasMoreComments && !showAll && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleShowAll(index)}
                className="w-full text-primary hover:text-primary/80"
              >
                Read {updateComments.length - 3} more{" "}
                {updateComments.length - 3 === 1 ? "comment" : "comments"}
              </Button>
            )}

            {hasMoreComments && showAll && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleShowAll(index)}
                className="w-full text-primary hover:text-primary/80"
              >
                Show less
              </Button>
            )}

            <div className="flex gap-2">
              <Textarea
                placeholder="Leave a message of support..."
                value={newComment[index] || ""}
                onChange={(e) => setNewComment((prev) => ({ ...prev, [index]: e.target.value }))}
                className="min-h-[60px] resize-none"
              />
              <Button
                size="icon"
                onClick={() => addComment(index)}
                disabled={!newComment[index]?.trim()}
                className="flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
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

  return (
    <div className="space-y-3 md:space-y-4">
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
                  {dog.careProvider?.rating && (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const rating = dog.careProvider?.rating ?? 0;
                        return (
                          <svg
                            key={star}
                            className={`h-3.5 w-3.5 ${
                              star <= Math.floor(rating)
                                ? "fill-amber-400 text-amber-400"
                                : star - 0.5 <= rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-gray-300 text-gray-300"
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        );
                      })}
                      <span className="ml-0.5 text-xs font-medium text-muted-foreground">
                        {dog.careProvider?.rating?.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 md:gap-4 md:items-stretch">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
          <Image
            src={dog.images[currentImageIndex] || "/placeholder.svg"}
            alt={`${dog.name} - Image ${currentImageIndex + 1}`}
            fill
            className="object-cover"
            priority
          />

          {dog.images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={previousImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {dog.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-1.5 w-1.5 rounded-full transition-all ${
                      index === currentImageIndex ? "w-4 bg-primary" : "bg-background/60"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {dog.headline && (
          <div className="relative flex flex-col items-center justify-center rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-6 md:p-8 shadow-sm">
            <Popover open={shareOpen} onOpenChange={setShareOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-3 top-3 h-9 w-9 bg-background/80 backdrop-blur-sm hover:bg-background"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3" align="end">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground mb-3">Share on:</p>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 bg-transparent"
                    onClick={() => handleShare("whatsapp")}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 bg-transparent"
                    onClick={() => handleShare("twitter")}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    X (Twitter)
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 bg-transparent"
                    onClick={() => handleShare("instagram")}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.073-1.689-.073-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    Instagram
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

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

      <Tabs defaultValue="campaign" className="w-full hidden md:block">
        <TabsList className="mb-4 w-full justify-start overflow-x-auto overflow-y-hidden bg-muted/50 p-1.5 md:mb-6 flex md:grid md:grid-cols-6 gap-2">
          <TabsTrigger
            value="campaign"
            className="whitespace-nowrap shrink-0 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Campaign
          </TabsTrigger>
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
          <h2 className="font-sans text-xl font-bold text-foreground md:text-2xl lg:text-3xl">
            Active Campaign
          </h2>

          {dog.goal > 0 ? (
            <div className="space-y-6">
              {/* Campaign Status Card */}
              <div className="rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-foreground">
                    {dog.headline || `Help ${dog.name} Recover`}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">Campaign Status: Active</p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">Fundraising Progress</span>
                    <span className="text-muted-foreground">
                      {dog.goal > 0 ? Math.round((dog.raised / dog.goal) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all"
                      style={{ width: `${Math.min((dog.raised / dog.goal) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 rounded-lg bg-background/60">
                    <div className="text-2xl font-bold text-foreground">
                      ${dog.raised.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Raised</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-background/60">
                    <div className="text-2xl font-bold text-foreground">
                      ${dog.goal.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Goal</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-background/60">
                    <div className="text-2xl font-bold text-foreground">
                      ${(dog.raised - (dog.spent || 0)).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Remaining</div>
                  </div>
                </div>
              </div>

              {/* Funds Needed For */}
              {dog.fundsNeededFor && dog.fundsNeededFor.length > 0 && (
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="font-semibold text-lg mb-4">Funds Needed For:</h3>
                  <div className="flex flex-wrap gap-2">
                    {dog.fundsNeededFor.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-4 py-2 rounded-full border bg-background"
                      >
                        <span className="text-lg">
                          {iconMap[item.label] || iconMap[item] || "❤️"}
                        </span>
                        <span className="text-sm font-medium">{item.label || item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Condition */}
              {dog.currentCondition && (
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="font-semibold text-lg mb-3">Current Condition</h3>
                  <p className="text-foreground/90 leading-relaxed">{dog.currentCondition}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-8 text-center">
              <p className="text-yellow-800 font-medium">
                This dog doesn't have an active fundraising campaign yet. Check back soon or contact
                the care provider for more information.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="journey" className="space-y-3 md:space-y-4">
          <h2 className="font-sans text-xl font-bold text-foreground md:text-2xl lg:text-3xl">
            {dog.name}'s Story
          </h2>
          <div className="space-y-3 text-pretty text-sm leading-relaxed text-foreground/90 md:space-y-4 md:text-base">
            {dog.story.split("\n\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="updates" className="space-y-3 md:space-y-4">
          <h2 className="font-sans text-xl font-bold text-foreground md:text-2xl lg:text-3xl">
            {dog.name}&apos;s Feed
          </h2>
          {updates.length > 0 ? (
            <>
              <div className="space-y-4 md:space-y-6">
                {currentUpdates.map((update, index) =>
                  renderUpdateCard(update, startIndex + index)
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="gap-2 bg-transparent"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="gap-2 bg-transparent"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
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
        </TabsContent>

        <TabsContent value="careprovider" className="space-y-4 md:space-y-6">
          {dog.careProvider && (
            <>
              <h2 className="font-sans text-xl font-bold text-foreground md:text-2xl lg:text-3xl">
                About the Care Provider
              </h2>

              <div className="overflow-hidden rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-6 shadow-lg md:p-8">
                <div className="mb-6 flex items-start gap-4 md:gap-6">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-4 border-primary shadow-lg md:h-32 md:w-32">
                    <Image
                      src={dog.careProvider.image || "/placeholder.svg"}
                      alt={dog.careProvider.name}
                      fill
                      className="object-cover"
                    />
                    {dog.careProvider.rating && dog.careProvider.rating >= 4.5 && (
                      <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg border-2 border-white">
                        <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="mb-1 font-sans text-2xl font-bold text-foreground md:text-3xl lg:text-4xl">
                      {dog.careProvider.name}
                    </h3>
                    <p className="mb-3 text-base text-primary font-semibold md:text-lg">
                      {dog.careProvider.type}
                    </p>

                    {dog.careProvider?.rating && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const rating = dog.careProvider?.rating ?? 0;
                            return (
                              <svg
                                key={star}
                                className={`h-5 w-5 md:h-6 md:w-6 ${
                                  star <= Math.floor(rating)
                                    ? "fill-amber-400 text-amber-400"
                                    : star - 0.5 <= rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "fill-gray-300 text-gray-300"
                                }`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            );
                          })}
                        </div>
                        <span className="text-lg font-semibold text-foreground md:text-xl">
                          {dog.careProvider?.rating?.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {(dog.careProvider.description || dog.careProvider.about) && (
                  <div className="mb-6 p-4 rounded-lg bg-background/50">
                    <h4 className="font-semibold text-lg mb-2 text-foreground">About</h4>
                    <p className="text-pretty text-base leading-relaxed text-foreground/90">
                      {dog.careProvider.about || dog.careProvider.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {dog.careProvider.location && (
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                      <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-muted-foreground mb-1">
                          Location
                        </div>
                        <div className="text-base text-foreground">{dog.careProvider.location}</div>
                      </div>
                    </div>
                  )}

                  {dog.careProvider.email && (
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                      <svg
                        className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <div>
                        <div className="text-sm font-semibold text-muted-foreground mb-1">
                          Email
                        </div>
                        <a
                          href={`mailto:${dog.careProvider.email}`}
                          className="text-base text-primary hover:underline"
                        >
                          {dog.careProvider.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {dog.careProvider.phone && (
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                      <svg
                        className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <div>
                        <div className="text-sm font-semibold text-muted-foreground mb-1">
                          Phone
                        </div>
                        <a
                          href={`tel:${dog.careProvider.phone}`}
                          className="text-base text-primary hover:underline"
                        >
                          {dog.careProvider.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {dog.careProvider.website && (
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                      <svg
                        className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                      <div>
                        <div className="text-sm font-semibold text-muted-foreground mb-1">
                          Website
                        </div>
                        <a
                          href={dog.careProvider.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base text-primary hover:underline flex items-center gap-1"
                        >
                          Visit Website
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href={
                    `/profile/${getProfileRoute(dog.careProvider.type)}/${dog.careProvider.id}` as Route
                  }
                  className="inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 md:text-base"
                >
                  View Full Profile
                </Link>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="expenses" className="space-y-3 md:space-y-4">
          <h2 className="font-sans text-xl font-bold text-foreground md:text-2xl lg:text-3xl">
            Expense Report
          </h2>
          {dog.expenses && dog.expenses.length > 0 ? (
            <div className="space-y-2 md:space-y-3">
              {dog.expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-4"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">{expense.title}</div>
                    {expense.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {expense.description}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">{expense.date}</div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <div className="font-bold text-foreground">
                        ${expense.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-emerald-600">Paid</div>
                    </div>
                    {expense.proof && (
                      <a href={expense.proof} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}

              <div className="mt-4 rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Total Expenses:</span>
                  <span className="text-2xl font-bold text-primary">
                    ${dog.expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border bg-muted/30 p-8 text-center">
              <p className="text-muted-foreground">
                No expenses have been reported yet for this campaign.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="transparency" className="space-y-3 md:space-y-4">
          <h3 className="font-sans text-lg font-bold text-foreground md:text-xl">
            Transaction History
          </h3>
          <p className="text-xs text-muted-foreground md:text-sm">
            All crypto donations are recorded on the blockchain for complete transparency. Click the
            link icon to view the full transaction.
          </p>

          {sortedTransactions.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[600px]">
                <thead className="bg-muted">
                  <tr>
                    <th
                      className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-foreground hover:bg-muted/80"
                      onClick={() => toggleSort("date")}
                    >
                      Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Crypto Amount
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-foreground hover:bg-muted/80"
                      onClick={() => toggleSort("amount")}
                    >
                      USD Value {sortBy === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Donor
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      TX Hash
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                      View
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTransactions.map((tx, index) => (
                    <tr key={index} className="border-t hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm text-foreground">{tx.date}</td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {tx.cryptoAmount} {tx.tokenSymbol}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        ${tx.usdValue.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
                        {truncateAddress(tx.donor)}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
                        {truncateAddress(tx.txHash)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <a
                          href={tx.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-lg border bg-muted/30 p-8 text-center">
              <p className="text-muted-foreground">No transactions yet. Be the first to donate!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

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
          {mobileTab === "campaign" && (
            <div className="rounded-lg bg-gradient-to-br from-purple-50 via-purple-50/50 to-white p-6 border border-purple-200/50 shadow-sm space-y-3 md:space-y-4">
              <h2 className="font-sans text-xl font-bold text-foreground md:text-2xl lg:text-3xl">
                Active Campaign
              </h2>

              {dog.goal > 0 ? (
                <div className="space-y-6">
                  {/* Campaign Status Card */}
                  <div className="rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-6 shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-foreground">
                        {dog.headline || `Help ${dog.name} Recover`}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">Campaign Status: Active</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">Fundraising Progress</span>
                        <span className="text-muted-foreground">
                          {dog.goal > 0 ? Math.round((dog.raised / dog.goal) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-primary h-3 rounded-full transition-all"
                          style={{ width: `${Math.min((dog.raised / dog.goal) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="text-center p-4 rounded-lg bg-background/60">
                        <div className="text-2xl font-bold text-foreground">
                          ${dog.raised.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Raised</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-background/60">
                        <div className="text-2xl font-bold text-foreground">
                          ${dog.goal.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Goal</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-background/60">
                        <div className="text-2xl font-bold text-foreground">
                          ${(dog.raised - (dog.spent || 0)).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Remaining</div>
                      </div>
                    </div>
                  </div>

                  {/* Funds Needed For */}
                  {dog.fundsNeededFor && dog.fundsNeededFor.length > 0 && (
                    <div className="rounded-lg border bg-card p-6">
                      <h3 className="font-semibold text-lg mb-4">Funds Needed For:</h3>
                      <div className="flex flex-wrap gap-2">
                        {dog.fundsNeededFor.map((item: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border bg-background"
                          >
                            <span className="text-lg">
                              {iconMap[item.label] || iconMap[item] || "❤️"}
                            </span>
                            <span className="text-sm font-medium">{item.label || item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Current Condition */}
                  {dog.currentCondition && (
                    <div className="rounded-lg border bg-card p-6">
                      <h3 className="font-semibold text-lg mb-3">Current Condition</h3>
                      <p className="text-foreground/90 leading-relaxed">{dog.currentCondition}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-8 text-center">
                  <p className="text-yellow-800 font-medium">
                    This dog doesn't have an active fundraising campaign yet. Check back soon or
                    contact the care provider for more information.
                  </p>
                </div>
              )}
            </div>
          )}

          {mobileTab === "updates" && (
            <div className="rounded-lg bg-gradient-to-br from-purple-50 via-purple-50/50 to-white p-6 border border-purple-200/50 shadow-sm space-y-3 md:space-y-4">
              <h2 className="font-sans text-xl font-bold text-foreground md:text-2xl lg:text-3xl">
                {dog.name}'s Feed
              </h2>
              {updates.length > 0 ? (
                <>
                  <div className="space-y-4 md:space-y-6">
                    {currentUpdates.map((update, index) =>
                      renderUpdateCard(update, startIndex + index)
                    )}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex flex-col gap-3 border-t pt-4">
                      <div className="text-center text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={goToPreviousPage}
                          disabled={currentPage === 1}
                          className="flex-1 gap-2 bg-transparent"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>

                        <Button
                          variant="outline"
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                          className="flex-1 gap-2 bg-transparent"
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
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
            </div>
          )}

          {mobileTab === "careprovider" && (
            <div className="rounded-lg bg-gradient-to-br from-purple-50 via-purple-50/50 to-white p-6 border border-purple-200/50 shadow-sm space-y-4 md:space-y-6">
              {dog.careProvider && (
                <>
                  <h2 className="font-sans text-xl font-bold text-foreground md:text-2xl lg:text-3xl">
                    About the Care Provider
                  </h2>

                  <div className="overflow-hidden rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-6 shadow-lg md:p-8">
                    <div className="mb-6 flex items-start gap-4 md:gap-6">
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-4 border-primary shadow-lg md:h-32 md:w-32">
                        <Image
                          src={dog.careProvider.image || "/placeholder.svg"}
                          alt={dog.careProvider.name}
                          fill
                          className="object-cover"
                        />
                        {dog.careProvider?.rating && dog.careProvider.rating >= 4.5 && (
                          <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg border-2 border-white">
                            <svg
                              className="h-5 w-5 text-white"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="mb-1 font-sans text-2xl font-bold text-foreground md:text-3xl lg:text-4xl">
                          {dog.careProvider.name}
                        </h3>
                        <p className="mb-3 text-base text-primary font-semibold md:text-lg">
                          {dog.careProvider.type}
                        </p>

                        {dog.careProvider?.rating && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => {
                                const rating = dog.careProvider?.rating ?? 0;
                                return (
                                  <svg
                                    key={star}
                                    className={`h-5 w-5 md:h-6 md:w-6 ${
                                      star <= Math.floor(rating)
                                        ? "fill-amber-400 text-amber-400"
                                        : star - 0.5 <= rating
                                          ? "fill-amber-400 text-amber-400"
                                          : "fill-gray-300 text-gray-300"
                                    }`}
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                );
                              })}
                              <span className="ml-0.5 text-xs font-medium text-muted-foreground">
                                {dog.careProvider?.rating?.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {(dog.careProvider.description || dog.careProvider.about) && (
                      <div className="mb-6 p-4 rounded-lg bg-background/50">
                        <h4 className="font-semibold text-lg mb-2 text-foreground">About</h4>
                        <p className="text-pretty text-base leading-relaxed text-foreground/90">
                          {dog.careProvider.about || dog.careProvider.description}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-3 mb-6">
                      {dog.careProvider.location && (
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                          <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="text-sm font-semibold text-muted-foreground mb-1">
                              Location
                            </div>
                            <div className="text-base text-foreground">
                              {dog.careProvider.location}
                            </div>
                          </div>
                        </div>
                      )}

                      {dog.careProvider.email && (
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                          <svg
                            className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <div>
                            <div className="text-sm font-semibold text-muted-foreground mb-1">
                              Email
                            </div>
                            <a
                              href={`mailto:${dog.careProvider.email}`}
                              className="text-base text-primary hover:underline break-all"
                            >
                              {dog.careProvider.email}
                            </a>
                          </div>
                        </div>
                      )}

                      {dog.careProvider.phone && (
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                          <svg
                            className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <div>
                            <div className="text-sm font-semibold text-muted-foreground mb-1">
                              Phone
                            </div>
                            <a
                              href={`tel:${dog.careProvider.phone}`}
                              className="text-base text-primary hover:underline"
                            >
                              {dog.careProvider.phone}
                            </a>
                          </div>
                        </div>
                      )}

                      {dog.careProvider.website && (
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                          <svg
                            className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                            />
                          </svg>
                          <div>
                            <div className="text-sm font-semibold text-muted-foreground mb-1">
                              Website
                            </div>
                            <a
                              href={dog.careProvider.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-base text-primary hover:underline flex items-center gap-1"
                            >
                              Visit Website
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    <Link
                      href={
                        `/profile/${getProfileRoute(dog.careProvider.type)}/${dog.careProvider.id}` as Route
                      }
                      className="inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 md:text-base w-full text-center"
                    >
                      View Full Profile
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}

          {mobileTab === "expenses" && (
            <div className="rounded-lg bg-gradient-to-br from-purple-50 via-purple-50/50 to-white p-6 border border-purple-200/50 shadow-sm space-y-3 md:space-y-4">
              <h2 className="font-sans text-xl font-bold text-foreground md:text-2xl lg:text-3xl">
                Expense Report
              </h2>
              {dog.expenses && dog.expenses.length > 0 ? (
                <div className="space-y-2 md:space-y-3">
                  {dog.expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between rounded-lg border bg-card p-4"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{expense.title}</div>
                        {expense.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {expense.description}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">{expense.date}</div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <div className="font-bold text-foreground">
                            ${expense.amount.toLocaleString()}
                          </div>
                          <div className="text-sm text-emerald-600">Paid</div>
                        </div>
                        {expense.proof && (
                          <a href={expense.proof} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="mt-4 rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">Total Expenses:</span>
                      <span className="text-2xl font-bold text-primary">
                        ${dog.expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border bg-muted/30 p-8 text-center">
                  <p className="text-muted-foreground">
                    No expenses have been reported yet for this campaign.
                  </p>
                </div>
              )}
            </div>
          )}

          {mobileTab === "transparency" && (
            <div className="rounded-lg bg-gradient-to-br from-purple-50 via-purple-50/50 to-white p-6 border border-purple-200/50 shadow-sm space-y-3 md:space-y-4">
              <h3 className="font-sans text-lg font-bold text-foreground md:text-xl">
                Transaction History
              </h3>
              <p className="text-xs text-muted-foreground md:text-sm">
                All crypto donations are recorded on the blockchain for complete transparency. Click
                the link icon to view the full transaction.
              </p>

              {sortedTransactions.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-muted">
                      <tr>
                        <th
                          className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-foreground hover:bg-muted/80"
                          onClick={() => toggleSort("date")}
                        >
                          Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                          Crypto Amount
                        </th>
                        <th
                          className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-foreground hover:bg-muted/80"
                          onClick={() => toggleSort("amount")}
                        >
                          USD Value {sortBy === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                          Donor
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                          TX Hash
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                          View
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTransactions.map((tx, index) => (
                        <tr key={index} className="border-t hover:bg-muted/50">
                          <td className="px-4 py-3 text-sm text-foreground">{tx.date}</td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {tx.cryptoAmount} {tx.tokenSymbol}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-foreground">
                            ${tx.usdValue.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
                            {truncateAddress(tx.donor)}
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
                            {truncateAddress(tx.txHash)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <a
                              href={tx.explorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center text-primary hover:text-primary/80"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-lg border bg-muted/30 p-8 text-center">
                  <p className="text-muted-foreground">
                    No transactions yet. Be the first to donate!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedUpdateImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedUpdateImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-4xl">
            <Button
              variant="outline"
              size="icon"
              className="absolute -right-4 -top-4 h-10 w-10 rounded-full bg-background"
              onClick={() => setSelectedUpdateImage(null)}
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="relative h-full w-full">
              <Image
                src={selectedUpdateImage || "/placeholder.svg"}
                alt="Update image"
                width={1200}
                height={800}
                className="h-auto max-h-[90vh] w-auto rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}

      <Dialog open={!!selectedUpdate} onOpenChange={(open) => !open && setSelectedUpdate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{selectedUpdate?.title}</DialogTitle>
            <p className="text-sm text-muted-foreground">{selectedUpdate?.date}</p>
          </DialogHeader>
          <div className="space-y-4">
            {selectedUpdate?.image && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={selectedUpdate.image || "/placeholder.svg"}
                  alt={selectedUpdate.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <p className="text-base leading-relaxed text-foreground/90">
              {selectedUpdate?.description}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
