export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createPodPoapClient, getPodPoapAdminKeypair } from "@/lib/contracts/podPoap";
import { getConfig } from "@/lib/config";
import { Keypair, TransactionBuilder } from "@stellar/stellar-sdk";
import { uploadMetadataToIPFS } from "@/lib/utils/ipfs";
import { getPODImageIPFS, getOrUploadPODImageIPFS } from "@/lib/utils/pod-ipfs";
import path from "path";

type MintForDonationPayload = {
  donorId: string;
  transactionId: string;
  donorAddress: string;
};

const TOKEN_DEFINITIONS = [
  { image: "Gemini_Generated_Image_10xvng10xvng10xv.png", label: "Aurora" },
  { image: "Gemini_Generated_Image_nkcuupnkcuupnkcu.png", label: "Harbor" },
  { image: "Gemini_Generated_Image_g0gwjeg0gwjeg0gw.png", label: "Summit" },
  { image: "Gemini_Generated_Image_y32s4ty32s4ty32s.png", label: "Bloom" },
  { image: "Gemini_Generated_Image_6xd9r26xd9r26xd9.png", label: "Solaris" },
  { image: "Gemini_Generated_Image_d7uouzd7uouzd7uo.png", label: "Nebula" },
  { image: "Gemini_Generated_Image_lcjl9mlcjl9mlcjl.png", label: "Horizon" },
  { image: "Gemini_Generated_Image_5aqvll5aqvll5aqv.png", label: "Mirage" },
  { image: "Gemini_Generated_Image_59h21f59h21f59h2.png", label: "Cascade" },
  { image: "Gemini_Generated_Image_d9axvtd9axvtd9ax.png", label: "Pulse" },
  { image: "Gemini_Generated_Image_5tgc995tgc995tgc.png", label: "Echo" },
  { image: "Gemini_Generated_Image_63cf1y63cf1y63cf.png", label: "Nova" },
  { image: "Gemini_Generated_Image_b5dmcb5dmcb5dmcb.png", label: "Vortex" },
  { image: "Gemini_Generated_Image_ki9m2iki9m2iki9m.png", label: "Prism" },
  { image: "Gemini_Generated_Image_kx2xczkx2xczkx2x.png", label: "Zenith" },
  { image: "Gemini_Generated_Image_pz0obspz0obspz0o.png", label: "Apex" },
  { image: "Gemini_Generated_Image_sl6rrmsl6rrmsl6r.png", label: "Crest" },
] as const;

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
}) {
  const sendResponse = await jsonRpc(rpcUrl, "sendTransaction", {
    transaction: signedTxXdr,
  });

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
    })) as any;

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

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as MintForDonationPayload;
    const { donorId, transactionId, donorAddress } = body;

    if (!donorId || !transactionId || !donorAddress) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: donorId, transactionId, donorAddress" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Verify the transaction exists and belongs to the donor
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .select("*, dogs(name), campaigns(dog_name)")
      .eq("id", transactionId)
      .eq("donor_id", donorId)
      .single();

    if (txError || !transaction) {
      return NextResponse.json(
        { ok: false, error: "Transaction not found or access denied" },
        { status: 404 }
      );
    }

    // Get the "First Donation" quest
    const { data: quest } = await supabase
      .from("quests")
      .select("id")
      .eq("name", "First Donation")
      .maybeSingle();

    // Check if NFT already minted for this transaction
    const { data: existingNft } = await supabase
      .from("donor_achievements")
      .select("nft_token_id, nft_minted")
      .eq("donor_id", donorId)
      .eq("quest_id", quest?.id || "")
      .eq("metadata->>transactionId", transactionId)
      .maybeSingle();

    if (existingNft?.nft_minted && existingNft.nft_token_id) {
      return NextResponse.json({
        ok: true,
        message: "NFT already minted for this donation",
        tokenId: existingNft.nft_token_id,
      });
    }

    // Get POD image based on donation amount or random selection
    const donationAmount = Number(transaction.usd_value || 0);
    const imageIndex = Math.min(
      Math.floor(donationAmount / 10) % TOKEN_DEFINITIONS.length,
      TOKEN_DEFINITIONS.length - 1
    );
    const tokenDefinition = TOKEN_DEFINITIONS[imageIndex];

    // Get or upload image to IPFS
    const imagePath = path.join("images", "POD", tokenDefinition.image);
    let imageIpfsUrl: string;
    try {
      // Try to get pre-uploaded IPFS URL first
      const existingIPFS = getPODImageIPFS(tokenDefinition.image);
      if (existingIPFS) {
        imageIpfsUrl = existingIPFS.ipfsUrl;
        console.log(`Using pre-uploaded IPFS URL for ${tokenDefinition.image}`);
      } else {
        // Upload if not found in mapping
        const imageResult = await getOrUploadPODImageIPFS(imagePath, tokenDefinition.image);
        imageIpfsUrl = imageResult.ipfsUrl;
      }
    } catch (ipfsError) {
      console.warn("Failed to upload image to IPFS, using HTTP fallback:", ipfsError);
      // Fallback to HTTP URL if IPFS fails
      const baseUrl = req.nextUrl.origin.replace(/\/$/, "");
      imageIpfsUrl = `${baseUrl}/images/POD/${tokenDefinition.image}`;
    }

    // Create metadata
    const dogName = transaction.dogs?.name || transaction.campaigns?.dog_name || "a dog in need";
    const metadata = {
      name: `Proof of Donation - ${dogName}`,
      description: `Commemorative Proof of Donation NFT celebrating your $${donationAmount} contribution to help ${dogName}. This NFT represents your generosity and support for animal rescue.`,
      image: imageIpfsUrl,
      attributes: [
        { trait_type: "Collection", value: "Proof of Donation" },
        { trait_type: "Series", value: tokenDefinition.label },
        { trait_type: "Donation Amount", value: `$${donationAmount.toFixed(2)}` },
        { trait_type: "Dog", value: dogName },
        { trait_type: "Transaction Hash", value: transaction.tx_hash || "" },
        { trait_type: "Donation Type", value: transaction.donation_type || "instant" },
      ],
      external_url: `${req.nextUrl.origin}/profile/donor`,
    };

    // Upload metadata to IPFS
    let metadataIpfsUrl: string;
    try {
      const metadataResult = await uploadMetadataToIPFS(metadata);
      metadataIpfsUrl = metadataResult.ipfsUrl;
    } catch (ipfsError) {
      console.warn("Failed to upload metadata to IPFS, using HTTP fallback:", ipfsError);
      // Fallback to HTTP URL
      metadataIpfsUrl = `${req.nextUrl.origin}/api/pod-poap/metadata/${imageIndex}`;
    }

    // Mint NFT
    const { secret, publicKey } = getPodPoapAdminKeypair();
    const client = await createPodPoapClient({ publicKey, secretKey: secret });

    // Get resolved options from client (same pattern as working mint route)
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

    // Define submitTransaction function (used for both mint and set_token_uri)
    async function submitTransaction(tx: { toXDR(): string }) {
      let signedTxXdr: string;

      // Always use the client's signTransaction function for Soroban transactions
      if (typeof signTransaction === "function") {
        try {
          const signed = await signTransaction(tx.toXDR(), {
            networkPassphrase,
            address: resolvePublicKey,
          });
          signedTxXdr = signed.signedTxXdr;
        } catch (signError) {
          console.error("Error signing transaction:", signError);
          throw new Error(
            `Failed to sign transaction: ${signError instanceof Error ? signError.message : String(signError)}`
          );
        }
      } else {
        // Fallback: try manual signing (may not work for Soroban transactions)
        try {
          const transaction = TransactionBuilder.fromXDR(tx.toXDR(), networkPassphrase);
          transaction.sign(Keypair.fromSecret(secret));
          signedTxXdr = transaction.toXDR();
        } catch (manualSignError) {
          console.error("Error with manual signing:", manualSignError);
          throw new Error(
            `Failed to manually sign transaction. Client signTransaction not available: ${manualSignError instanceof Error ? manualSignError.message : String(manualSignError)}`
          );
        }
      }

      return sendTransactionAndWait({
        rpcUrl,
        signedTxXdr,
      });
    }

    // Mint the NFT
    console.log("[mint-for-donation] Starting mint", {
      donorAddress,
      publicKey,
    });

    let mintTx;
    try {
      mintTx = await client.mint({ to: donorAddress, caller: publicKey });
      console.log("[mint-for-donation] Got mintTx");
    } catch (mintCallError) {
      console.error("[mint-for-donation] Error calling client.mint:", mintCallError);
      throw mintCallError;
    }

    let mintResult;
    try {
      mintResult = await submitTransaction(mintTx);
      console.log("[mint-for-donation] submitTransaction result", {
        hash: mintResult?.hash,
        status: mintResult?.status,
      });
    } catch (submitError) {
      console.error("[mint-for-donation] Error submitting mint transaction:", submitError);
      throw submitError;
    }

    // Get the newly minted token ID
    let tokenId: number | null = null;
    try {
      const balanceTx = await client.balance({ account: donorAddress });
      const balance = Number(balanceTx.result ?? 0);
      if (Number.isFinite(balance) && balance > 0) {
        const newestTokenTx = await client.get_owner_token_id({
          owner: donorAddress,
          index: balance - 1,
        });
        const newestTokenId = Number(newestTokenTx.result ?? Number.NaN);
        if (!Number.isNaN(newestTokenId)) {
          tokenId = newestTokenId;
        }
      }
    } catch (error) {
      console.error("Unable to determine newly minted token id:", error);
    }

    // Set token URI
    if (tokenId !== null) {
      try {
        const setUriTx = await client.set_token_uri({
          token_id: tokenId,
          uri: metadataIpfsUrl,
          caller: publicKey,
        });
        await submitTransaction(setUriTx);
      } catch (error) {
        console.error(`Failed to set token URI for token #${tokenId}:`, error);
      }
    }

    // Update achievement record with NFT info
    if (tokenId !== null && quest) {
      await supabase.from("donor_achievements").upsert(
        {
          donor_id: donorId,
          quest_id: quest.id,
          nft_minted: true,
          nft_token_id: tokenId.toString(),
          blockchain_tx_hash: mintResult.hash,
          metadata: {
            transactionId,
            donationAmount,
            dogName,
            imageIpfsUrl,
            metadataIpfsUrl,
          },
        },
        {
          onConflict: "donor_id,quest_id",
        }
      );
    }

    return NextResponse.json({
      ok: true,
      hash: mintResult.hash,
      status: mintResult.status,
      tokenId,
      tokenUri: metadataIpfsUrl,
      metadata,
    });
  } catch (error: any) {
    console.error("Error minting NFT for donation:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to mint NFT" },
      { status: 500 }
    );
  }
}
