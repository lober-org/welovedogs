"use client";

import { useState } from "react";
import { X, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";

interface DonationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  dogName: string;
  amount: number;
}

export function DonationSuccessModal({
  isOpen,
  onClose,
  dogName,
  amount,
}: DonationSuccessModalProps) {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `I just donated $${amount} to help ${dogName}! Join me in making a difference.`;

  const handleSubscribe = () => {
    if (email && email.includes("@")) {
      setIsSubscribed(true);
      // Here you would typically send the email to your backend
      console.log("Subscribing email:", email, "for dog:", dogName);
    }
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-[95vw] gap-0 overflow-y-auto p-0 md:max-w-md lg:max-w-lg">
        <div className="relative">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-2 top-2 z-10 rounded-full bg-white/80 hover:bg-white"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Thank You Image */}
          <div className="flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4 py-3 md:px-8 md:py-6">
            <Image
              src="/images/welove-thanks.svg"
              alt="Thank you for your donation"
              width={300}
              height={200}
              className="h-auto w-full max-w-[240px] md:max-w-[300px]"
            />
          </div>

          {/* Content */}
          <div className="space-y-2 p-4 md:space-y-4 md:p-8">
            <div className="text-center">
              <h2 className="font-sans text-xl font-bold text-foreground md:text-3xl">
                Thank You for Your Generosity!
              </h2>
              <p className="mt-2 text-balance text-sm text-muted-foreground md:text-base">
                Your ${amount} donation will make a real difference in {dogName}'s life. Together,
                we're giving hope and healing.
              </p>
            </div>

            {/* Social Share Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-sans text-sm font-semibold text-foreground">Share the Love</h3>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => handleShare("facebook")}
                >
                  <svg className="mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => handleShare("twitter")}
                >
                  <svg className="mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                  Twitter
                </Button>
              </div>
            </div>

            {/* Email Subscription Section */}
            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
              <h3 className="font-sans text-sm font-semibold text-foreground">
                Stay Updated on {dogName}'s Journey
              </h3>
              {!isSubscribed ? (
                <>
                  <p className="text-xs text-muted-foreground">
                    Get email updates about {dogName}'s progress and recovery milestones.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleSubscribe} disabled={!email || !email.includes("@")}>
                      Subscribe
                    </Button>
                  </div>
                </>
              ) : (
                <div className="rounded-md bg-green-50 p-3 text-center">
                  <p className="text-sm font-medium text-green-800">
                    ✓ You're subscribed! We'll keep you updated on {dogName}'s progress.
                  </p>
                </div>
              )}
            </div>

            {/* Close Button */}
            <Button onClick={onClose} variant="outline" className="w-full bg-transparent">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
