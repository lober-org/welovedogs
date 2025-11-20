export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { Account, Asset, Keypair, TransactionBuilder, Memo, Operation } from "@stellar/stellar-sdk";
import { getConfig } from "@/lib/config";

type DonationPayload = {
  from: string; // Donor's public key
  to: string; // Recipient's public key
  amount: string; // Amount as string (e.g., "10.5")
  signedXdr: string; // Signed transaction XDR from the client
  memo?: string; // Optional memo
};

// USDC on Stellar
// Mainnet: GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5E34NC4P3WZ
// Testnet: GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5 (USDC issuer)
// Testnet SAC Contract ID: CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA
// Reference: https://developers.stellar.org/docs/build/guides/basics/verify-trustlines
const USDC_ISSUER_MAINNET = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5E34NC4P3WZ";
const USDC_ISSUER_TESTNET = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const USDC_SAC_CONTRACT_TESTNET = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as DonationPayload;
    const { from, to, amount, signedXdr, memo } = body;

    if (!from || !to || !amount || !signedXdr) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: from, to, amount, signedXdr" },
        { status: 400 }
      );
    }

    // Validate addresses
    try {
      Keypair.fromPublicKey(from);
      Keypair.fromPublicKey(to);
    } catch (e) {
      return NextResponse.json(
        { ok: false, error: "Invalid Stellar address format" },
        { status: 400 }
      );
    }

    // Parse and validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { ok: false, error: "Invalid amount. Must be a positive number." },
        { status: 400 }
      );
    }

    // Validate the signed transaction XDR format
    const cfg = getConfig();
    const networkPassphrase =
      cfg.stellarNetwork === "public" || cfg.stellarNetwork === "mainnet"
        ? "Public Global Stellar Network ; September 2015"
        : "Test SDF Network ; September 2015";

    try {
      TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
    } catch (e) {
      return NextResponse.json({ ok: false, error: "Invalid transaction XDR" }, { status: 400 });
    }

    // Submit the transaction using fetch (to avoid Server import issues)
    const submitResponse = await fetch(`${cfg.horizonUrl}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `tx=${encodeURIComponent(signedXdr)}`,
    });

    const resultJson = await submitResponse.json().catch(() => ({}));

    if (!submitResponse.ok || resultJson.successful === false) {
      const extras = (resultJson as any).extras;
      const resultCodes = extras?.result_codes;

      const errorMessage =
        resultCodes?.transaction ||
        resultCodes?.operations?.[0] ||
        resultJson.detail ||
        `Transaction submission failed: ${submitResponse.statusText}`;

      return NextResponse.json(
        {
          ok: false,
          error: errorMessage,
          extras: resultCodes ?? extras ?? null,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      hash: resultJson.hash || resultJson.id,
      ledger: resultJson.ledger || resultJson.ledger_attr,
      successful: resultJson.successful !== false, // Default to true if not specified
    });
  } catch (error: any) {
    const message =
      error?.response?.data?.extras?.result_codes?.operations?.[0] ||
      error?.response?.data?.detail ||
      error?.message ||
      "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

// Helper function to build a donation transaction (for client-side use)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const amount = searchParams.get("amount");
  const memo = searchParams.get("memo");

  if (!from || !to || !amount) {
    return NextResponse.json(
      { ok: false, error: "Missing required query params: from, to, amount" },
      { status: 400 }
    );
  }

  try {
    const cfg = getConfig();
    const networkPassphrase =
      cfg.stellarNetwork === "public" || cfg.stellarNetwork === "mainnet"
        ? "Public Global Stellar Network ; September 2015"
        : "Test SDF Network ; September 2015";

    // Load the source account using fetch (to avoid Server import issues)
    const accountResponse = await fetch(`${cfg.horizonUrl}/accounts/${from}`);
    if (!accountResponse.ok) {
      throw new Error(`Failed to load account: ${accountResponse.statusText}`);
    }
    const accountData = await accountResponse.json();

    // Create account object for TransactionBuilder
    const sourceAccount = new Account(from, accountData.sequence);

    // Determine asset - use USDC for both testnet and mainnet
    const isMainnet = cfg.stellarNetwork === "public" || cfg.stellarNetwork === "mainnet";
    const issuer = isMainnet ? USDC_ISSUER_MAINNET : USDC_ISSUER_TESTNET;

    // Validate issuer address
    try {
      Keypair.fromPublicKey(issuer);
    } catch (e) {
      throw new Error(`Invalid issuer address: ${issuer}`);
    }

    // Create USDC asset
    const paymentAsset = new Asset("USDC", issuer);

    // Parse amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid amount" }, { status: 400 });
    }

    // Build transaction with a single payment operation
    const baseFee = 100;
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: String(baseFee),
      networkPassphrase,
    }).addOperation(
      Operation.payment({
        destination: to,
        asset: paymentAsset,
        amount: amount,
      })
    );

    // Add memo if provided (max 28 bytes for Stellar)
    if (memo) {
      // Truncate memo to 28 bytes max
      const maxMemoLength = 28;
      const truncatedMemo = memo.length > maxMemoLength ? memo.substring(0, maxMemoLength) : memo;
      transaction.addMemo(Memo.text(truncatedMemo));
    }

    const tx = transaction.setTimeout(30).build();

    return NextResponse.json({
      ok: true,
      xdr: tx.toXDR(),
      networkPassphrase,
    });
  } catch (error: any) {
    const message = error?.message || "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
