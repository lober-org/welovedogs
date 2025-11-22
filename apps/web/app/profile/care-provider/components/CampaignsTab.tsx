"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { CampaignCard } from "./CampaignCard";
import { TabHeader } from "./TabHeader";
import { EmptyState } from "./EmptyState";
import type { Campaign } from "../types";

interface CampaignsTabProps {
  campaigns: Campaign[];
}

export function CampaignsTab({ campaigns }: CampaignsTabProps) {
  const [campaignSortOrder, setCampaignSortOrder] = useState<"newest" | "oldest">("newest");
  const [campaignStatusFilter, setCampaignStatusFilter] = useState<"all" | "active" | "closed">(
    "all"
  );

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (campaignStatusFilter === "all") return true;
    if (campaignStatusFilter === "active") return campaign.status === "Active";
    if (campaignStatusFilter === "closed") return campaign.status === "Closed";
    return true;
  });

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    const dateA = new Date(a.createdDate).getTime();
    const dateB = new Date(b.createdDate).getTime();
    return campaignSortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  const emptyMessage =
    campaignStatusFilter === "all" ? "No campaigns yet" : `No ${campaignStatusFilter} campaigns`;

  return (
    <Card className="shadow-xl bg-purple-50">
      <CardContent className="p-4 md:p-6">
        <TabHeader
          title="Campaign Management"
          actions={
            <>
              <select
                className="px-3 py-2 border rounded-lg text-sm"
                value={campaignStatusFilter}
                onChange={(e) => setCampaignStatusFilter(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCampaignSortOrder(campaignSortOrder === "newest" ? "oldest" : "newest")
                }
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                {campaignSortOrder === "newest" ? "Newest" : "Oldest"}
              </Button>
              <Link href="/profile/care-provider/create-dog">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                  Create Dog Profile
                </Button>
              </Link>
              <Link href="/profile/care-provider/create-campaign">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  Create New Campaign
                </Button>
              </Link>
            </>
          }
        />

        <div className="space-y-4">
          {sortedCampaigns.map((campaign) => (
            <CampaignCard key={campaign.dogId} campaign={campaign} />
          ))}
        </div>

        {sortedCampaigns.length === 0 && (
          <EmptyState
            message={emptyMessage}
            actionLabel="Create Your First Campaign"
            actionHref="/profile/care-provider/create-campaign"
          />
        )}
      </CardContent>
    </Card>
  );
}
