"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import type { Campaign } from "../types";

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const progressPercentage =
    campaign.goal > 0 ? Math.min((campaign.raised / campaign.goal) * 100, 100) : 0;
  const fundedPercentage =
    campaign.goal > 0 ? Math.round((campaign.raised / campaign.goal) * 100) : 0;

  return (
    <Link href={`/profile/care-provider/campaign/${campaign.dogId}`}>
      <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-lg border-2 border-purple-200 p-4 hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer">
        <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden">
          <Image
            src={campaign.dogImage || "/placeholder.svg"}
            alt={campaign.dogName}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-800">{campaign.dogName}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-3 w-3" />
                {new Date(campaign.createdDate).toLocaleDateString()}
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                campaign.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {campaign.status}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold">
                ${campaign.raised.toLocaleString()} / ${campaign.goal.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Spent: ${campaign.spent.toLocaleString()}</span>
              <span>{fundedPercentage}% funded</span>
            </div>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 self-center" />
      </div>
    </Link>
  );
}
