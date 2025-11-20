"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Share2, Lock, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

function DonationSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dogName = searchParams.get("dogName") || "this dog";
  const amount = searchParams.get("amount") || "0";

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [collectibleClaimed, setCollectibleClaimed] = useState(false);

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
                  <div className="rounded-2xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 p-4 text-center">
                    <div className="mb-3 flex justify-center">
                      {!collectibleClaimed ? (
                        <Image
                          src="/golden-dog-paw-badge-collectible.jpg"
                          alt="Collectible badge"
                          width={80}
                          height={80}
                          className="rounded-2xl"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                          <Sparkles className="h-10 w-10 text-white" />
                        </div>
                      )}
                    </div>
                    <h2 className="mb-2 font-sans text-lg font-bold text-foreground">
                      {!collectibleClaimed ? "Your Collectible Awaits!" : "Collectible Claimed!"}
                    </h2>
                    <p className="mb-3 text-xs text-muted-foreground">
                      {!collectibleClaimed
                        ? `This exclusive badge represents your donation to ${dogName}.`
                        : "Thank you for being a hero!"}
                    </p>
                    {!collectibleClaimed && (
                      <Button
                        size="sm"
                        onClick={handleClaimCollectible}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-sm font-semibold text-white hover:from-purple-700 hover:to-pink-700"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Claim Collectible
                      </Button>
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
