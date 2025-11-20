"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  Shield,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CreateEscrowModal } from "@/components/CreateEscrowModal";
import { Label } from "@/components/ui/label";

interface Campaign {
  id: string;
  dogId: string;
  dogName: string;
  dogImage: string;
  raised: number;
  spent: number;
  goal: number;
  headline: string;
  status: string;
  escrowContractId?: string | null;
  stellarAddress?: string | null; // Campaign's stellar_address field
  careProviderStellarAddress?: string | null; // Care provider's stellar_address
}

interface Update {
  id: string;
  title: string;
  content: string;
  image?: string;
  date: string;
}

interface Expense {
  id: string;
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

export default function CampaignManagementClient({
  campaign,
  updates: initialUpdates,
  expenses: initialExpenses,
  donations,
}: {
  campaign: Campaign;
  updates: Update[];
  expenses: Expense[];
  donations: Donation[];
}) {
  const [updates, setUpdates] = useState<Update[]>(initialUpdates);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [isEditingHeadline, setIsEditingHeadline] = useState(false);
  const [headline, setHeadline] = useState(campaign.headline);
  const [editHeadline, setEditHeadline] = useState(campaign.headline);
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isEscrowModalOpen, setIsEscrowModalOpen] = useState(false);
  const [escrowContractId, setEscrowContractId] = useState<string | null>(
    campaign.escrowContractId || null
  );

  const handleSaveHeadline = () => {
    setHeadline(editHeadline);
    setIsEditingHeadline(false);
  };

  const handleCancelHeadline = () => {
    setEditHeadline(headline);
    setIsEditingHeadline(false);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const sortedDonations = [...donations].sort((a, b) => {
    if (sortBy === "date") {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    } else {
      return sortOrder === "asc" ? a.usdValue - b.usdValue : b.usdValue - a.usdValue;
    }
  });

  const toggleSort = (column: "date" | "amount") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const progressPercentage = campaign.goal > 0 ? (campaign.raised / campaign.goal) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-50/50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/profile/care-provider">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          <div className="flex items-start gap-6">
            <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={campaign.dogImage || "/placeholder.svg?height=128&width=128"}
                alt={campaign.dogName}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl font-bold">{campaign.dogName}'s Campaign</h1>
                <Badge variant={campaign.status === "Active" ? "default" : "secondary"}>
                  {campaign.status}
                </Badge>
                {escrowContractId && (
                  <Badge variant="outline" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Escrow Active
                  </Badge>
                )}
              </div>
              {isEditingHeadline ? (
                <div className="flex gap-2 items-center">
                  <Input
                    value={editHeadline}
                    onChange={(e) => setEditHeadline(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleSaveHeadline}>
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancelHeadline}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground">{headline}</p>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingHeadline(true)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Escrow Section */}
        {campaign.stellarAddress && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Escrow Account
              </CardTitle>
              <Button
                onClick={() => setIsEscrowModalOpen(true)}
                variant={escrowContractId ? "outline" : "default"}
                size="sm"
              >
                <Shield className="mr-2 h-4 w-4" />
                {escrowContractId ? "Edit Escrow" : "Create Escrow"}
              </Button>
            </CardHeader>
            <CardContent>
              {escrowContractId ? (
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Escrow Contract ID</Label>
                    <p className="font-mono text-sm break-all mt-1">{escrowContractId}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Stellar Address</Label>
                    <p className="font-mono text-sm break-all mt-1">{campaign.stellarAddress}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    No escrow account has been created for this campaign yet.
                  </p>
                  <Button onClick={() => setIsEscrowModalOpen(true)} variant="outline">
                    <Shield className="mr-2 h-4 w-4" />
                    Create Escrow Account
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Raised
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${campaign.raised.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground mt-1">
                of ${campaign.goal.toLocaleString()} goal
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${campaign.spent.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {expenses.length} expenses reported
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${(campaign.raised - campaign.spent).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Available for treatment</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="donations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>

          {/* Donations Tab */}
          <TabsContent value="donations">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Donation History</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toggleSort("date")}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toggleSort("amount")}>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Amount {sortBy === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {sortedDonations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No donations yet</p>
                ) : (
                  <div className="space-y-4">
                    {sortedDonations.map((donation, index) => (
                      <div
                        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {donation.cryptoAmount} {donation.tokenSymbol}
                            </p>
                            <Badge variant="secondary">${donation.usdValue.toFixed(2)}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            From: {truncateAddress(donation.donor)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(donation.date).toLocaleDateString()}
                          </p>
                        </div>
                        <a href={donation.explorerUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Campaign Updates</CardTitle>
                <Link href={`/profile/care-provider/campaign/${campaign.dogId}/post-update`}>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Post Update
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {updates.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No updates posted yet</p>
                ) : (
                  <div className="space-y-6">
                    {updates.map((update) => (
                      <div key={update.id} className="border-b pb-6 last:border-0">
                        <div className="flex items-start gap-4">
                          {update.image && (
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={update.image || "/placeholder.svg"}
                                alt={update.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{update.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {new Date(update.date).toLocaleDateString()}
                            </p>
                            <p className="text-muted-foreground">{update.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Expense Reports</CardTitle>
                <Link href={`/profile/care-provider/campaign/${campaign.dogId}/report-expense`}>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Report Expense
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {expenses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No expenses reported yet</p>
                ) : (
                  <div className="space-y-4">
                    {expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{expense.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {expense.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(expense.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">${expense.amount.toFixed(2)}</p>
                          {expense.proof && (
                            <a href={expense.proof} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm" className="mt-2">
                                <FileText className="w-4 h-4 mr-1" />
                                View Receipt
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Escrow Creation Modal */}
        {campaign.stellarAddress && (
          <CreateEscrowModal
            open={isEscrowModalOpen}
            onOpenChange={setIsEscrowModalOpen}
            campaignId={campaign.id}
            dogName={campaign.dogName}
            careProviderAddress={campaign.careProviderStellarAddress || campaign.stellarAddress}
            campaignStellarAddress={campaign.stellarAddress}
            goal={campaign.goal}
            existingEscrowId={escrowContractId}
            onSuccess={(contractId) => {
              setEscrowContractId(contractId);
              setIsEscrowModalOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
