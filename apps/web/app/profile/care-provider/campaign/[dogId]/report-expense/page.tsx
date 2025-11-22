"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Upload,
  FileText,
  X,
  Eye,
  AlertCircle,
  DollarSign,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

export default function ReportExpensePage() {
  const params = useParams();
  const router = useRouter();
  const dogId = params.dogId as string;
  const supabase = createBrowserClient();

  const [expenseForm, setExpenseForm] = useState({
    title: "",
    description: "",
    amount: "",
    proof: null as File | null,
  });
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setExpenseForm({ ...expenseForm, proof: file });
      const reader = new FileReader();
      reader.onloadend = () => setProofPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to report expenses");
      }

      console.log("Submitting expense for dog:", dogId);

      const { data: careProvider, error: careProviderError } = await supabase
        .from("care_providers")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (careProviderError || !careProvider) {
        throw new Error("Care provider profile not found");
      }

      console.log("Found care provider:", careProvider.id);

      const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .select("id, spent")
        .eq("dog_id", dogId)
        .single();

      if (campaignError || !campaign) {
        throw new Error("Campaign not found for this dog");
      }

      console.log("Found campaign:", campaign.id);

      // Upload proof file to Supabase Storage
      let proofUrl: string | null = null;
      if (expenseForm.proof) {
        const fileExt = expenseForm.proof.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${expenseForm.proof.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

        console.log("Uploading proof file:", fileName);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("expense-proofs")
          .upload(fileName, expenseForm.proof, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Error uploading proof:", uploadError);
          throw new Error(`Failed to upload proof: ${uploadError.message}`);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("expense-proofs").getPublicUrl(fileName);

        proofUrl = publicUrl;
        console.log("Proof uploaded successfully:", proofUrl);
      }

      const expenseAmount = Number.parseFloat(expenseForm.amount);

      // Insert expense into database
      const { data: expenseData, error: expenseError } = await supabase
        .from("campaign_expenses")
        .insert({
          campaign_id: campaign.id,
          dog_id: dogId,
          title: expenseForm.title,
          description: expenseForm.description,
          amount: expenseAmount,
          proof: proofUrl,
          created_by: careProvider.id,
        })
        .select()
        .single();

      if (expenseError) {
        console.error("Error creating expense:", expenseError);
        throw new Error(`Failed to create expense: ${expenseError.message}`);
      }

      console.log("Expense created successfully:", expenseData);

      // Update campaign's spent amount
      const newSpent = Number(campaign.spent || 0) + expenseAmount;
      const { error: updateError } = await supabase
        .from("campaigns")
        .update({ spent: newSpent })
        .eq("id", campaign.id);

      if (updateError) {
        console.error("Error updating campaign spent:", updateError);
        // Don't throw here - expense was created successfully
        console.warn("Expense created but campaign spent amount update failed");
      }

      console.log("Expense report submitted successfully");
      router.push(`/profile/care-provider/campaign/${dogId}`);
    } catch (err: any) {
      console.error("Error in handleSubmit:", err);
      setError(err.message || "Failed to submit expense report");
      setIsLoading(false);
    }
  };

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-3 py-4 md:px-4 md:py-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-4 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <Button variant="outline" size="sm" onClick={() => setShowPreview(false)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Edit
              </Button>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                Preview Your Expense Report
              </h1>
              <div className="hidden sm:block sm:w-24" />
            </div>

            <Card className="mb-4 md:mb-6 border-2 border-yellow-400 bg-yellow-50">
              <CardContent className="flex items-start gap-2 md:gap-3 p-3 md:p-4">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-yellow-600" />
                <div>
                  <h3 className="mb-1 text-sm md:text-base font-semibold text-yellow-900">
                    Important: Expense reports cannot be edited
                  </h3>
                  <p className="text-xs md:text-sm text-yellow-800">
                    Once submitted, this expense will be permanently recorded and visible to donors.
                    Please verify all information is accurate before submitting.
                  </p>
                </div>
              </CardContent>
            </Card>

            {error && (
              <Card className="mb-4 md:mb-6 border-2 border-red-400 bg-red-50">
                <CardContent className="flex items-start gap-2 md:gap-3 p-3 md:p-4">
                  <AlertCircle className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-red-600" />
                  <div>
                    <h3 className="mb-1 text-sm md:text-base font-semibold text-red-900">Error</h3>
                    <p className="text-xs md:text-sm text-red-800">{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="mb-4 md:mb-6 shadow-xl">
              <CardContent className="p-4 md:p-8">
                <div className="mb-4 md:mb-6 flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="mb-2 text-2xl md:text-3xl font-bold text-gray-800">
                      {expenseForm.title}
                    </h2>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-orange-100 px-3 py-2 md:px-4 md:py-2">
                    <div className="text-xs md:text-sm text-orange-700">Amount</div>
                    <div className="text-xl md:text-2xl font-bold text-orange-600">
                      ${Number.parseFloat(expenseForm.amount).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="mb-4 md:mb-6">
                  <h3 className="mb-2 text-sm md:text-base font-semibold text-gray-700">
                    Description
                  </h3>
                  <p className="text-sm md:text-base whitespace-pre-wrap text-gray-600">
                    {expenseForm.description}
                  </p>
                </div>

                {proofPreview && (
                  <div>
                    <h3 className="mb-2 text-sm md:text-base font-semibold text-gray-700">
                      Proof of Expense
                    </h3>
                    <div className="relative h-64 md:h-96 overflow-hidden rounded-lg border-2 border-gray-200">
                      <Image
                        src={proofPreview || "/placeholder.svg"}
                        alt="Proof"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-4 md:mt-6 rounded-lg bg-gray-50 p-3 md:p-4">
                  <div className="flex items-start gap-2 md:gap-3">
                    <FileText className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-gray-500" />
                    <div className="text-xs md:text-sm text-gray-600">
                      <p className="font-medium break-all">{expenseForm.proof?.name}</p>
                      <p className="text-xs text-gray-500">
                        Size: {((expenseForm.proof?.size || 0) / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:flex-1 bg-transparent"
                onClick={() => setShowPreview(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                size="lg"
                className="w-full sm:flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                <Upload className="mr-2 h-5 w-5" />
                {isLoading ? "Submitting..." : "Submit Expense Report"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-3 py-4 md:px-4 md:py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 md:mb-6 flex items-center gap-4">
            <Link href={`/profile/care-provider/campaign/${dogId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Back to Campaign</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
          </div>

          <Card className="shadow-xl">
            <CardContent className="p-4 md:p-8">
              <div className="mb-6">
                <h1 className="mb-2 text-2xl md:text-3xl font-bold text-gray-800">
                  Report Campaign Expense
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  Document expenses with proof to maintain transparency with donors
                </p>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div>
                  <Label htmlFor="title" className="mb-2 block text-sm md:text-base font-semibold">
                    Expense Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Post-op Medication"
                    value={expenseForm.title}
                    onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                    className="text-base md:text-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="amount" className="mb-2 block text-sm md:text-base font-semibold">
                    Amount (USD) *
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      className="pl-10 text-base md:text-lg"
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="description"
                    className="mb-2 block text-sm md:text-base font-semibold"
                  >
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    rows={6}
                    placeholder="Describe what this expense was for..."
                    value={expenseForm.description}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, description: e.target.value })
                    }
                    className="text-sm md:text-base"
                  />
                </div>

                <div>
                  <Label className="mb-2 block text-sm md:text-base font-semibold">
                    Upload Proof (Invoice/Receipt) *
                  </Label>
                  {proofPreview ? (
                    <div className="relative overflow-hidden rounded-lg border-2 border-gray-200">
                      <img
                        src={proofPreview || "/placeholder.svg"}
                        alt="Proof"
                        className="h-48 md:h-64 w-full object-contain bg-gray-50"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 md:right-4 md:top-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setProofPreview(null);
                          setExpenseForm({ ...expenseForm, proof: null });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="proof"
                      className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-8 md:py-12 transition-colors hover:border-orange-400 hover:bg-orange-50"
                    >
                      <FileText className="mb-3 h-10 w-10 md:h-12 md:w-12 text-gray-400" />
                      <span className="mb-1 text-sm md:text-base font-medium text-gray-700">
                        Click to upload invoice or receipt
                      </span>
                      <span className="text-xs md:text-sm text-gray-500">
                        PNG, JPG, PDF up to 10MB
                      </span>
                      <input
                        id="proof"
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={handleProofChange}
                      />
                    </label>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
                  <Link
                    href={`/profile/care-provider/campaign/${dogId}`}
                    className="w-full sm:flex-1"
                  >
                    <Button variant="outline" size="lg" className="w-full bg-transparent">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    className="w-full sm:flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    disabled={
                      !expenseForm.title ||
                      !expenseForm.amount ||
                      !expenseForm.description ||
                      !expenseForm.proof
                    }
                    onClick={() => setShowPreview(true)}
                  >
                    <Eye className="mr-2 h-5 w-5" />
                    Preview Expense Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
