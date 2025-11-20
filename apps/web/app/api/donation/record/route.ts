export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getTransactionExplorerUrl } from "@/lib/utils/stellar-explorer";

type RecordDonationPayload = {
  donorId?: string; // Optional - will be fetched from auth if not provided
  dogId: string;
  campaignId?: string;
  txHash: string;
  amount: number; // USD value
  donationType: "escrow" | "instant";
  contractId?: string; // For escrow donations
  donorAddress?: string; // Stellar wallet address of the donor
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as RecordDonationPayload;
    const { donorId, dogId, campaignId, txHash, amount, donationType, contractId, donorAddress } =
      body;

    if (!dogId || !txHash || !amount) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: dogId, txHash, amount" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Get donor ID from authenticated user if not provided
    let finalDonorId = donorId;
    if (!finalDonorId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: donor } = await supabase
          .from("donors")
          .select("id")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (donor) {
          finalDonorId = donor.id;
        }
      }
    }

    // If still no donor ID, we can still record the transaction but without donor link
    // This allows guest donations to be tracked

    // Check if transaction already exists
    const { data: existingTx } = await supabase
      .from("transactions")
      .select("id")
      .eq("tx_hash", txHash)
      .maybeSingle();

    if (existingTx) {
      return NextResponse.json({
        ok: true,
        message: "Donation already recorded",
        transactionId: existingTx.id,
      });
    }

    // Get dog's campaign if campaignId not provided
    let finalCampaignId = campaignId;
    if (!finalCampaignId) {
      const { data: campaign } = await supabase
        .from("campaigns")
        .select("id")
        .eq("dog_id", dogId)
        .eq("status", "Active")
        .maybeSingle();
      finalCampaignId = campaign?.id || null;
    }

    // Build Stellar Expert explorer URL for the transaction
    const explorerUrl = getTransactionExplorerUrl(txHash);

    // Record the transaction
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        donor_id: finalDonorId || null,
        dog_id: dogId,
        campaign_id: finalCampaignId,
        tx_hash: txHash,
        usd_value: amount,
        crypto_amount: amount.toString(), // Assuming USDC 1:1 with USD
        token_symbol: "USDC",
        type: "donation", // Set type to "donation"
        donation_type: donationType, // escrow or instant
        escrow_contract_id: contractId || null,
        donor_address: donorAddress || null, // Store the donor's Stellar wallet address
        explorer_url: explorerUrl,
        description: `Donation of $${amount} ${donationType === "escrow" ? "via escrow" : "instant"}`,
      })
      .select()
      .single();

    if (txError) {
      console.error("Error recording transaction:", txError);
      return NextResponse.json(
        { ok: false, error: `Failed to record transaction: ${txError.message}` },
        { status: 500 }
      );
    }

    // Update quest progress if donor ID exists
    if (finalDonorId) {
      try {
        const { updateQuestProgress } = await import("@/app/actions/update-quest-progress");
        await updateQuestProgress(finalDonorId);
      } catch (questError) {
        console.error("Error updating quest progress:", questError);
        // Don't fail the request if quest update fails
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Donation recorded successfully",
      transactionId: transaction.id,
      donorId: finalDonorId || null,
      transaction: {
        id: transaction.id,
        tx_hash: transaction.tx_hash,
        usd_value: transaction.usd_value,
      },
    });
  } catch (error: any) {
    console.error("Error in record donation:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
