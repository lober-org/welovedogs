import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Plus,
  DollarSign,
  Calendar,
  FileText,
  Edit2,
  Save,
  X,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import CampaignManagementClient from "./CampaignManagementClient";
import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

interface Update {
  id: number;
  title: string;
  content: string;
  image?: string;
  date: string;
}

interface Expense {
  id: number;
  title: string;
  description: string;
  amount: number;
  date: string;
  proof: string;
}

interface Donation {
  date: string;
  cryptoAmount: string;
  tokenSymbol: string;
  usdValue: number;
  donor: string;
  txHash: string;
  explorerUrl: string;
}

export default async function CampaignManagementPage({
  params,
}: {
  params: Promise<{ dogId: string }>;
}) {
  const { dogId } = await params;
  const supabase = await createServerClient();

  console.log("Campaign management page - dogId:", dogId);

  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select(
      `
      *,
      dogs (
        id,
        name,
        images
      ),
      care_providers (
        id,
        stellar_address
      )
    `
    )
    .eq("dog_id", dogId)
    .maybeSingle();

  console.log("Campaign data:", campaign);
  console.log("Campaign error:", campaignError);

  if (!campaign) {
    console.log("No campaign found for dog_id:", dogId);
    notFound();
  }

  const { data: updates } = await supabase
    .from("campaign_updates")
    .select("*")
    .eq("campaign_id", campaign.id)
    .order("created_at", { ascending: false });

  const { data: expenses } = await supabase
    .from("campaign_expenses")
    .select("*")
    .eq("campaign_id", campaign.id)
    .order("created_at", { ascending: false });

  const { data: donations } = await supabase
    .from("transactions")
    .select("*")
    .eq("campaign_id", campaign.id)
    .order("created_at", { ascending: false });

  const campaignData = {
    id: campaign.id,
    dogId: campaign.dog_id,
    dogName: campaign.dog_name || campaign.dogs?.name || "Unknown",
    dogImage: campaign.dog_image || campaign.dogs?.images?.[0] || "/placeholder.svg",
    raised: Number(campaign.raised || 0),
    spent: Number(campaign.spent || 0),
    goal: Number(campaign.goal || 0),
    status: campaign.status || "Active",
    headline: campaign.headline || `${campaign.dog_name} needs your help`,
    escrowContractId: campaign.escrow_contract_id || null,
    stellarAddress: campaign.stellar_address || null, // Campaign's stellar_address field
    careProviderStellarAddress: campaign.care_providers?.stellar_address || null, // Care provider's address
  };

  const updatesData =
    updates?.map((update) => ({
      id: update.id,
      title: update.title,
      content: update.content,
      image: update.image,
      date: new Date(update.created_at).toISOString().split("T")[0],
    })) || [];

  const expensesData =
    expenses?.map((expense) => ({
      id: expense.id,
      title: expense.title,
      description: expense.description,
      amount: Number(expense.amount),
      date: new Date(expense.created_at).toISOString().split("T")[0],
      proof: expense.proof,
    })) || [];

  const donationsData =
    donations?.map((donation) => ({
      date: new Date(donation.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      cryptoAmount: donation.crypto_amount,
      tokenSymbol: donation.token_symbol,
      usdValue: Number(donation.usd_value),
      donor: donation.donor_address,
      txHash: donation.tx_hash,
      explorerUrl: donation.explorer_url || `https://etherscan.io/tx/${donation.tx_hash}`,
    })) || [];

  return (
    <CampaignManagementClient
      campaign={campaignData}
      updates={updatesData}
      expenses={expensesData}
      donations={donationsData}
    />
  );
}
