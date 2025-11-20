"use client";

import { useCallback, useState } from "react";
import { useWalletsKit } from "./useWalletsKit";
import { getConfig } from "@/lib/config";
import { TransactionBuilder } from "@stellar/stellar-sdk";

export type DonationResult = {
  hash: string;
  ledger?: number;
  successful: boolean;
};

export type DonationError = {
  message: string;
  code?: string;
};

// USDC on Stellar Testnet
const USDC_ISSUER_TESTNET = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5E34NC4P3WZ";
const USDC_ISSUER_MAINNET = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5E34NC4P3WZ";

export function useDonation() {
  const { address, signTransaction, network } = useWalletsKit();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<DonationError | null>(null);

  const donate = useCallback(
    async (recipientAddress: string, amount: string, memo?: string): Promise<DonationResult> => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      setIsLoading(true);
      setError(null);

      try {
        const cfg = getConfig();
        const networkPassphrase =
          cfg.stellarNetwork === "public" || cfg.stellarNetwork === "mainnet"
            ? "Public Global Stellar Network ; September 2015"
            : "Test SDF Network ; September 2015";

        // Validate amount
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
          throw new Error("Invalid amount. Must be a positive number.");
        }

        // Get transaction XDR from API (server-side builds it to avoid Server import issues)
        const buildResponse = await fetch(
          `/api/donation?from=${encodeURIComponent(address)}&to=${encodeURIComponent(recipientAddress)}&amount=${encodeURIComponent(amount)}${memo ? `&memo=${encodeURIComponent(memo)}` : ""}`
        );

        const buildResult = await buildResponse.json();
        if (!buildResult.ok) {
          throw new Error(buildResult.error || "Failed to build transaction");
        }

        // Parse the transaction XDR
        const transaction = TransactionBuilder.fromXDR(
          buildResult.xdr,
          buildResult.networkPassphrase || networkPassphrase
        );

        // Sign the transaction
        const signedXdr = await signTransaction(transaction.toXDR(), {
          networkPassphrase: buildResult.networkPassphrase || networkPassphrase,
        });

        // Submit the transaction
        const response = await fetch("/api/donation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: address,
            to: recipientAddress,
            amount,
            signedXdr,
            memo,
          }),
        });

        const result = await response.json();

        if (!result.ok) {
          throw new Error(result.error || "Donation failed");
        }

        return {
          hash: result.hash,
          ledger: result.ledger,
          successful: result.successful,
        };
      } catch (err: any) {
        const error: DonationError = {
          message: err?.message || "Failed to process donation",
          code: err?.code,
        };
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [address, signTransaction]
  );

  return {
    donate,
    isLoading,
    error,
    isConnected: !!address,
  };
}
