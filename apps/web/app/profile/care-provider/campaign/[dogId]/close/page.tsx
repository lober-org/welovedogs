"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, AlertCircle, Heart, Home, Stethoscope, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function CloseCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const dogId = params.dogId as string;

  // Mock campaign data
  const campaign = {
    dogName: "Luna",
    dogImage: "/placeholder.svg",
  };

  const [outcome, setOutcome] = useState("");
  const [finalUpdateTitle, setFinalUpdateTitle] = useState("");
  const [finalUpdateContent, setFinalUpdateContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const outcomes = [
    { value: "adopted", label: "Adopted", icon: Heart, description: "Found a forever home" },
    {
      value: "cured",
      label: "Fully Recovered",
      icon: Stethoscope,
      description: "Treatment completed successfully",
    },
    {
      value: "home",
      label: "Returned Home",
      icon: Home,
      description: "Reunited with original owner",
    },
    {
      value: "recovery",
      label: "In Long-term Recovery",
      icon: CheckCircle,
      description: "Ongoing care in stable condition",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Redirect to campaign page or success page
    router.push(`/profile/care-provider/campaign/${dogId}`);
  };

  const isFormValid = outcome && finalUpdateTitle.trim() && finalUpdateContent.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-50/50 to-white">
      <div className="container mx-auto px-3 py-4 md:px-4 md:py-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-4 md:mb-6 flex items-center gap-4">
            <Link href={`/profile/care-provider/campaign/${dogId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Campaign
              </Button>
            </Link>
          </div>

          {/* Campaign Info */}
          <Card className="mb-6 overflow-hidden shadow-xl border-2 border-purple-200">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 md:p-6">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0 overflow-hidden rounded-lg border-3 border-white shadow-lg">
                  <Image
                    src={campaign.dogImage || "/placeholder.svg"}
                    alt={campaign.dogName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Close Campaign</h1>
                  <p className="text-white/90 text-sm md:text-base">
                    {campaign.dogName}'s Campaign
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Warning Card */}
          <Card className="mb-6 border-2 border-amber-200 bg-amber-50 shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="flex gap-3">
                <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="font-bold text-amber-900 text-base md:text-lg">
                    Important: Closing This Campaign
                  </h3>
                  <p className="text-sm md:text-base text-amber-800 leading-relaxed">
                    Once you close this campaign,{" "}
                    <strong>donations will no longer be accepted</strong> and you will not be able
                    to post updates or report expenses for {campaign.dogName}. Please provide a
                    final update explaining the outcome to give donors closure on their
                    contributions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Close Campaign Form */}
          <Card className="shadow-xl border-2 border-purple-100">
            <CardContent className="p-4 md:p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Outcome Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-gray-800">
                    What was the final outcome for {campaign.dogName}?{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup value={outcome} onValueChange={setOutcome} className="space-y-3">
                    {outcomes.map((option) => {
                      const Icon = option.icon;
                      return (
                        <div
                          key={option.value}
                          className={`flex items-start gap-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                            outcome === option.value
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
                          }`}
                          onClick={() => setOutcome(option.value)}
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={option.value}
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon
                                className={`h-5 w-5 ${outcome === option.value ? "text-purple-600" : "text-gray-600"}`}
                              />
                              <Label
                                htmlFor={option.value}
                                className="font-semibold text-gray-800 cursor-pointer text-base"
                              >
                                {option.label}
                              </Label>
                            </div>
                            <p className="text-sm text-gray-600">{option.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>

                {/* Final Update Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-semibold text-gray-800">
                    Final Update Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={finalUpdateTitle}
                    onChange={(e) => setFinalUpdateTitle(e.target.value)}
                    placeholder="e.g., Luna Found Her Forever Home!"
                    className="text-base"
                    required
                  />
                </div>

                {/* Final Update Content */}
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-base font-semibold text-gray-800">
                    Final Update Message <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Share the complete story of what happened with {campaign.dogName}. Let your
                    donors know how their support made a difference.
                  </p>
                  <Textarea
                    id="content"
                    value={finalUpdateContent}
                    onChange={(e) => setFinalUpdateContent(e.target.value)}
                    placeholder={`Tell donors about ${campaign.dogName}'s final outcome and thank them for their support...`}
                    rows={8}
                    className="text-base resize-none"
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                  <Link href={`/profile/care-provider/campaign/${dogId}`} className="flex-1">
                    <Button type="button" variant="outline" className="w-full bg-transparent">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Closing Campaign..." : "Close Campaign & Post Final Update"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
