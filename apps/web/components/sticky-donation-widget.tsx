"use client";

import { useState } from "react";
import { Heart, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface DonationWidgetProps {
  dogName: string;
  raised: number;
  spent: number;
  fundsNeededFor: Array<{ icon: string; label: string }> | string[];
}

export function StickyDonationWidget({
  dogName,
  raised,
  spent,
  fundsNeededFor,
}: DonationWidgetProps) {
  const router = useRouter();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [donationType, setDonationType] = useState<"escrow" | "instant">("escrow");

  const handleDonate = async () => {
    const amount = selectedAmount || Number.parseFloat(customAmount);
    if (!amount || amount <= 0) return;

    setIsProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 2500));

    router.push(
      `/donation-success?dog=${encodeURIComponent(dogName)}&amount=${amount}&type=${donationType}`
    );
  };

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

        {/* Raised Progress */}
        <div className="mb-3 md:mb-4">
          <div className="mb-1.5 flex items-end justify-between">
            <span className="font-sans text-xs md:text-sm font-semibold text-white">
              Amount Raised
            </span>
            <span className="font-sans text-xl md:text-2xl font-bold text-white">
              ${raised.toLocaleString()}
            </span>
          </div>
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

        <div className="mb-3 md:mb-4 rounded-xl bg-white/95 p-2.5 md:p-3">
          <h3 className="mb-2 font-sans text-xs md:text-sm font-bold text-gray-900">
            Donation Type
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
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

        {normalizedFunds.length > 0 && (
          <div className="mb-3 md:mb-4 rounded-xl bg-white/95 p-2.5 md:p-3">
            <h3 className="mb-2 font-sans text-xs md:text-sm font-bold text-gray-900">
              How Your Donation Helps {dogName}
            </h3>
            <div className="space-y-1.5">
              {normalizedFunds.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-lg bg-purple-50 px-2 py-1.5"
                >
                  <div className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-purple-600 flex-shrink-0">
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
            <label className="mb-1 block font-sans text-[10px] md:text-xs font-medium text-gray-700">
              Or enter custom amount
            </label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 font-sans text-xs text-gray-500">
                $
              </span>
              <input
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

        {/* Donate Button */}
        <Button
          onClick={handleDonate}
          disabled={isProcessing || (!selectedAmount && !customAmount)}
          className="mb-2 md:mb-3 w-full rounded-lg bg-purple-600 py-3 md:py-4 font-sans text-sm md:text-base font-bold text-white shadow-lg transition-all hover:bg-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
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
            className="h-3 w-3 md:h-3.5 md:w-3.5 text-white flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
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

function getIconEmoji(icon: string): string {
  const iconMap: Record<string, string> = {
    // Emergency & Surgery
    Emergency: "🚨",
    "Emergency Care": "🚨",
    Surgery: "🏥",
    ICU: "⚕️",

    // Medical Treatment
    Medication: "💊",
    Vaccination: "💉",
    Rehabilitation: "🦴",
    Treatment: "💉",
    Tests: "🔬",
    "Dental Care": "🦷",
    "Spay/Neuter": "⚕️",

    // Care & Support
    Food: "🍖",
    "Special Diet": "🍖",
    Care: "❤️",
    Therapy: "🩺",
    "Behavioral Training": "🐕",
    "Grooming / Hygiene": "✨",

    // Facility & Equipment
    "Shelter / Housing": "🏠",
    "Temporary Foster Care": "🏡",
    Transportation: "🚗",
    "Specialized Equipment": "🔧",

    // Specific Treatments
    "Post-Surgery Care": "🏥",
    "Pain Medication": "💊",
    "Physical Therapy": "🦴",
    Chemotherapy: "💉",
    "Oncology Tests": "🔬",
    "Pain Relief": "💊",
    "Dental Surgery": "🦷",
    Extraction: "🦷",
    Antibiotics: "💊",
    "Post-Op Care": "❤️",
    Supplements: "💊",
    "High-Quality Nutrition": "🍖",
    "Pain Management": "💊",
    "Recovery Care": "❤️",
    "Heartworm Medication": "💊",
    "Blood Tests": "🔬",
    "Nutritional Support": "🍖",
    "Tooth Extractions": "🦷",
    "Rehabilitation / Training": "🦴",

    // Default
    Other: "💝",
  };
  return iconMap[icon] || "❤️";
}
