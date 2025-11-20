export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { Keypair, TransactionBuilder } from "@stellar/stellar-sdk";
import { createPodPoapClient, getPodPoapAdminKeypair } from "@/lib/contracts/podPoap";
import { getConfig } from "@/lib/config";

type MintPayload = {
  to?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as MintPayload;
    const to = body.to;

    if (!to) {
      return NextResponse.json(
        { ok: false, error: "Missing 'to' field in request body." },
        { status: 400 }
      );
    }

    const { secret, publicKey } = getPodPoapAdminKeypair();
    const client = await createPodPoapClient({ publicKey, secretKey: secret });

    const resolvedOptions =
      (
        client as unknown as {
          __podPoapResolvedOptions?: Record<string, unknown>;
        }
      ).__podPoapResolvedOptions ?? {};

    const networkPassphrase = String(
      resolvedOptions.networkPassphrase ?? "Test SDF Network ; September 2015"
    );
    const rpcUrl =
      (resolvedOptions.rpcUrl as string | undefined) ??
      process.env.NEXT_PUBLIC_STELLAR_SOROBAN_RPC_URL ??
      "https://soroban-testnet.stellar.org";

    const signTransaction = resolvedOptions.signTransaction as
      | ((
          xdr: string,
          opts?: { networkPassphrase?: string; address?: string }
        ) => Promise<{ signedTxXdr: string; signerAddress?: string }>)
      | undefined;

    const resolvePublicKey = (resolvedOptions.publicKey as string | undefined) ?? publicKey;

    async function submitTransaction(tx: { toXDR(): string }) {
      let signedTxXdr: string;
      if (typeof signTransaction === "function") {
        const signed = await signTransaction(tx.toXDR(), {
          networkPassphrase,
          address: resolvePublicKey,
        });
        signedTxXdr = signed.signedTxXdr;
      } else {
        const transaction = TransactionBuilder.fromXDR(tx.toXDR(), networkPassphrase);
        transaction.sign(Keypair.fromSecret(secret));
        signedTxXdr = transaction.toXDR();
      }

      return sendTransactionAndWait({
        rpcUrl,
        signedTxXdr,
      });
    }

    // Before minting, verify the caller has made a qualifying USDC donation
    const hasDonation = await hasQualifyingDonation(to);
    if (!hasDonation) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "No qualifying donation found for this wallet. Please donate first, then mint your POD.",
        },
        { status: 403 }
      );
    }

    const mintTx = await client.mint({ to, caller: publicKey });
    const mintResult = await submitTransaction(mintTx);

    let tokenId: number | null = null;
    let tokenUri: string | null = null;

    try {
      const balanceTx = await client.balance({ account: to });
      const balance = Number(balanceTx.result ?? 0);
      if (Number.isFinite(balance) && balance > 0) {
        const newestTokenTx = await client.get_owner_token_id({
          owner: to,
          index: balance - 1,
        });
        const newestTokenId = Number(newestTokenTx.result ?? Number.NaN);
        if (!Number.isNaN(newestTokenId)) {
          tokenId = newestTokenId;
        }
      }
    } catch (error) {
      console.error(
        "[pod-poap][mint] unable to determine newly minted token id:",
        error instanceof Error ? (error.stack ?? error.message) : error
      );
    }

    if (tokenId !== null) {
      try {
        const metadataBase = new URL("/api/pod-poap/metadata", req.nextUrl.origin)
          .toString()
          .replace(/\/$/, "");
        tokenUri = `${metadataBase}/${tokenId}`;
        const setUriTx = await client.set_token_uri({
          token_id: tokenId,
          uri: tokenUri,
          caller: publicKey,
        });
        await submitTransaction(setUriTx);
      } catch (error) {
        console.error(
          `[pod-poap][mint] failed to set token URI for token #${tokenId}:`,
          error instanceof Error ? (error.stack ?? error.message) : error
        );
        tokenUri = null;
      }
    }

    return NextResponse.json({
      ok: true,
      hash: mintResult.hash,
      status: mintResult.status,
      to,
      tokenId,
      tokenUri,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

type SendTransactionResult = {
  hash: string;
  status: string;
  raw: any;
};

type JsonRpcResponse<T> =
  | { jsonrpc: string; id: number | string | null; result: T }
  | {
      jsonrpc: string;
      id: number | string | null;
      error: { code: number; message: string; data?: unknown };
    };

async function sendTransactionAndWait({
  rpcUrl,
  signedTxXdr,
  maxAttempts = 30,
  intervalMs = 1000,
}: {
  rpcUrl: string;
  signedTxXdr: string;
  maxAttempts?: number;
  intervalMs?: number;
}): Promise<SendTransactionResult> {
  const sendResponse = (await jsonRpc(rpcUrl, "sendTransaction", {
    transaction: signedTxXdr,
  })) as JsonRpcResponse<{
    status: string;
    hash: string;
    latestLedger?: number;
  }>;

  if ("error" in sendResponse) {
    throw new Error(
      `sendTransaction failed: ${sendResponse.error.message} (code ${sendResponse.error.code})`
    );
  }

  const { status: initialStatus, hash } = sendResponse.result;
  if (!hash) {
    throw new Error("sendTransaction did not return a transaction hash.");
  }

  if (initialStatus !== "PENDING") {
    throw new Error(`sendTransaction returned unexpected status: ${initialStatus}`);
  }

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    await delay(intervalMs);
    const getResponse = (await jsonRpc(rpcUrl, "getTransaction", {
      hash,
    })) as JsonRpcResponse<{
      status: string;
      resultXdr?: string;
      errorResultXdr?: string;
      [key: string]: unknown;
    }>;

    if ("error" in getResponse) {
      throw new Error(
        `getTransaction failed: ${getResponse.error.message} (code ${getResponse.error.code})`
      );
    }

    const { status, resultXdr, errorResultXdr } = getResponse.result;
    if (status === "NOT_FOUND" || status === "PENDING") {
      continue;
    }

    if (status === "FAILED") {
      throw new Error(
        `Transaction ${hash} failed.${errorResultXdr ? ` errorResultXdr=${errorResultXdr}` : ""}${
          resultXdr ? ` resultXdr=${resultXdr}` : ""
        }`
      );
    }

    return {
      hash,
      status,
      raw: getResponse.result,
    };
  }

  throw new Error(
    `Timed out waiting for transaction ${hash} to complete after ${maxAttempts} attempts.`
  );
}

async function jsonRpc(rpcUrl: string, method: string, params: Record<string, unknown>) {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `RPC request failed with status ${response.status}: ${response.statusText}${
        text ? ` - ${text}` : ""
      }`
    );
  }

  return response.json();
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check Horizon to verify that `donor` has sent a USDC payment
 * to the configured donation recipient.
 */
async function hasQualifyingDonation(donor: string): Promise<boolean> {
  const cfg = getConfig();

  const recipient =
    process.env.DONATION_RECIPIENT_ADDRESS || process.env.NEXT_PUBLIC_DEFAULT_DONATION_RECIPIENT;

  if (!recipient) {
    console.warn("[pod-poap][mint] Donation recipient not configured; skipping donation check.");
    return true;
  }

  const isMainnet = cfg.stellarNetwork === "public" || cfg.stellarNetwork === "mainnet";
  const USDC_ISSUER_MAINNET = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5E34NC4P3WZ";
  const USDC_ISSUER_TESTNET = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
  const issuer = isMainnet ? USDC_ISSUER_MAINNET : USDC_ISSUER_TESTNET;

  // Minimum donation threshold in USDC (optional)
  const minAmount = parseFloat(process.env.MIN_DONATION_USDC || "0") || 0;

  const url = new URL(`${cfg.horizonUrl}/payments`);
  url.searchParams.set("for_account", donor);
  url.searchParams.set("limit", "200");
  url.searchParams.set("order", "desc");

  const resp = await fetch(url.toString());
  if (!resp.ok) {
    console.error(
      "[pod-poap][mint] Failed to query Horizon payments for donation check:",
      resp.status,
      resp.statusText
    );
    return false;
  }

  const data = await resp.json().catch(() => ({}));
  const records = (data as any)._embedded?.records ?? [];

  for (const payment of records) {
    if (payment.type !== "payment") continue;
    if (payment.from !== donor) continue;
    if (payment.to !== recipient) continue;

    // Ensure it's the correct USDC asset
    if (payment.asset_type !== "credit_alphanum4") continue;
    if (payment.asset_code !== "USDC") continue;
    if (payment.asset_issuer !== issuer) continue;

    const amt = parseFloat(payment.amount);
    if (!Number.isFinite(amt)) continue;
    if (amt >= minAmount) {
      return true;
    }
  }

  return false;
}
