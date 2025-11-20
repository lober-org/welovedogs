export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/config";

/**
 * GET /api/donation/stats
 *
 * Horizon-based donation tracking (no Soroban contract).
 *
 * Query params:
 * - recipient: Address to get donations received
 * - donor: Address to get donations sent
 * - limit: Max number of donations to return (default: 10)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const recipient = searchParams.get("recipient");
    const donor = searchParams.get("donor");
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (!recipient && !donor) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing query param: provide at least 'recipient' or 'donor'.",
        },
        { status: 400 }
      );
    }

    const cfg = getConfig();
    const isMainnet = cfg.stellarNetwork === "public" || cfg.stellarNetwork === "mainnet";

    // USDC issuer (same as elsewhere in the app)
    const USDC_ISSUER_MAINNET = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5E34NC4P3WZ";
    const USDC_ISSUER_TESTNET = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
    const issuer = isMainnet ? USDC_ISSUER_MAINNET : USDC_ISSUER_TESTNET;

    const forAccount = recipient || donor!;

    // Use /accounts/{account}/payments instead of /payments?for_account=...
    // This is the correct Horizon endpoint to get payments for a specific account
    const url = new URL(`${cfg.horizonUrl}/accounts/${forAccount}/payments`);
    url.searchParams.set("limit", "200");
    url.searchParams.set("order", "desc");

    const resp = await fetch(url.toString());
    if (!resp.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `Failed to load payments: ${resp.statusText}`,
        },
        { status: 502 }
      );
    }

    const data = await resp.json().catch(() => ({}));
    const records = (data as any)._embedded?.records ?? [];

    // Debug: log what we're getting from Horizon
    console.log(
      `[donation][stats] Fetched ${records.length} records from Horizon for ${forAccount}`
    );
    if (records.length > 0) {
      console.log(`[donation][stats] First record sample:`, JSON.stringify(records[0], null, 2));
    }

    // Filter USDC payments involving the receiver or donor.
    // We only care that it's a USDC payment; we don't hard-enforce issuer to avoid mismatches.
    const usdcPayments = records.filter((p: any) => {
      if (p.type !== "payment") return false;
      // Check both asset_code and also look in asset if it's an object
      const assetCode = p.asset_code || p.asset?.code;
      if (assetCode !== "USDC") return false;
      return true;
    });

    console.log(`[donation][stats] Found ${usdcPayments.length} USDC payments after filtering`);

    // Donations received by recipient
    const recipientDonations =
      recipient != null
        ? usdcPayments
            .filter((p: any) => p.to === recipient)
            .slice(0, limit)
            .map((p: any, idx: number) => {
              const ts = p.created_at ? Math.floor(new Date(p.created_at).getTime() / 1000) : null;
              return {
                id: idx,
                donor: p.from,
                recipient: p.to,
                amount: p.amount,
                amountFormatted: p.amount,
                asset: "USDC",
                timestamp: ts !== null ? String(ts) : "",
                memo: undefined,
              };
            })
        : [];

    // Donations sent by donor
    const donorDonations =
      donor != null
        ? usdcPayments
            .filter((p: any) => p.from === donor)
            .slice(0, limit)
            .map((p: any, idx: number) => {
              const ts = p.created_at ? Math.floor(new Date(p.created_at).getTime() / 1000) : null;
              return {
                id: idx,
                donor: p.from,
                recipient: p.to,
                amount: p.amount,
                amountFormatted: p.amount,
                asset: "USDC",
                timestamp: ts !== null ? String(ts) : "",
                memo: undefined,
              };
            })
        : [];

    // Total donations count (all USDC payments for this account filtered by role)
    const totalDonations =
      recipient != null
        ? usdcPayments.filter((p: any) => p.to === recipient).length
        : donor != null
          ? usdcPayments.filter((p: any) => p.from === donor).length
          : usdcPayments.length;

    // Total amount received by recipient
    let recipientTotal: any = undefined;
    if (recipient != null) {
      const total = usdcPayments
        .filter((p: any) => p.to === recipient)
        .reduce((sum: number, p: any) => sum + parseFloat(p.amount || "0"), 0);

      recipientTotal = {
        address: recipient,
        totalAmount: total.toString(),
        totalAmountFormatted: total.toFixed(2),
      };
    }

    return NextResponse.json({
      ok: true,
      totalDonations,
      recipientTotal,
      recipientDonations,
      donorDonations,
    });
  } catch (error: any) {
    const message = error?.message || "Unknown error";
    console.error("[donation][stats] error:", error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
