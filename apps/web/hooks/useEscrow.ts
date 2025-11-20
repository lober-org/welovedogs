"use client";

import { useCallback, useState } from "react";
import {
  useInitializeEscrow,
  useFundEscrow,
  useGetEscrowFromIndexerByContractIds,
  useSendTransaction,
} from "@trustless-work/escrow/hooks";
import { useWalletsKit } from "./useWalletsKit";
import type {
  InitializeSingleReleaseEscrowPayload,
  FundEscrowPayload,
  GetEscrowFromIndexerByContractIdsParams,
} from "@trustless-work/escrow/types";

export type EscrowResult = {
  contractId: string;
  successful: boolean;
  hash?: string;
};

export type EscrowError = {
  message: string;
  code?: string;
};

export function useEscrow() {
  const { address, signTransaction } = useWalletsKit();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<EscrowError | null>(null);

  const { deployEscrow } = useInitializeEscrow();
  const { fundEscrow } = useFundEscrow();
  const { getEscrowByContractIds } = useGetEscrowFromIndexerByContractIds();
  const { sendTransaction } = useSendTransaction();

  const initializeCampaignEscrow = useCallback(
    async (
      campaignId: string,
      dogName: string,
      careProviderAddress: string, // For approver/serviceProvider roles
      receiverAddress: string, // For receiver role - campaign's stellar_address
      platformAddress: string,
      disputeResolverAddress: string,
      releaseSignerAddress: string,
      goal: number,
      platformFee: number = 0.05 // 5% default platform fee
    ): Promise<EscrowResult> => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      setIsLoading(true);
      setError(null);

      try {
        const payload: InitializeSingleReleaseEscrowPayload = {
          signer: address, // Required: address of the user signing the contract transaction
          engagementId: campaignId,
          title: `Campaign for ${dogName}`,
          description: `Escrow account for ${dogName}'s fundraising campaign`,
          amount: goal,
          platformFee,
          roles: {
            approver: careProviderAddress,
            serviceProvider: careProviderAddress,
            platformAddress,
            releaseSigner: releaseSignerAddress,
            disputeResolver: disputeResolverAddress,
            receiver: receiverAddress, // Campaign's stellar_address
          },
          milestones: [
            {
              description: `Funds for ${dogName}'s care and medical expenses`,
            },
          ],
          trustline: {
            address: process.env.NEXT_PUBLIC_TRUSTLINE_ADDRESS || address, // Use env variable or fallback to connected wallet
          },
        };

        console.log("Deploying escrow with payload:", JSON.stringify(payload, null, 2));

        // Step 1: Get unsigned transaction from API
        const deployResult = await deployEscrow(payload, "single-release");

        if (!deployResult || !deployResult.unsignedTransaction) {
          throw new Error("Failed to deploy escrow: No unsigned transaction returned");
        }

        console.log("Got unsigned transaction, signing...");
        console.log(
          "Unsigned XDR preview:",
          deployResult.unsignedTransaction.substring(0, 100) + "..."
        );

        // Step 2: Sign the transaction
        const signedXdr = await signTransaction(deployResult.unsignedTransaction);

        if (!signedXdr) {
          throw new Error("Failed to sign transaction");
        }

        console.log("Transaction signed, sending...");
        console.log("Signed XDR length:", signedXdr.length);
        console.log("Signed XDR preview:", signedXdr.substring(0, 100) + "...");

        // Validate that the signed XDR is different from unsigned (actually signed)
        if (signedXdr === deployResult.unsignedTransaction) {
          console.warn("Warning: Signed XDR appears to be the same as unsigned XDR");
        }

        // Step 3: Send the signed transaction
        let sendResult: {
          status: string;
          message: string;
          contractId?: string;
          [key: string]: unknown;
        };
        try {
          sendResult = await sendTransaction(signedXdr);
          console.log("Send transaction result:", sendResult);
        } catch (sendError: unknown) {
          console.error("Error sending transaction:", sendError);
          console.error("Error type:", typeof sendError);
          console.error(
            "Error keys:",
            sendError && typeof sendError === "object" ? Object.keys(sendError) : "N/A"
          );

          // The error might be thrown directly or returned in the response
          if (sendError && typeof sendError === "object") {
            const errorDetails = sendError as {
              statusCode?: number;
              message?: string;
              path?: string;
              timestamp?: string;
              [key: string]: unknown;
            };
            const errorMsg = `Failed to send transaction: ${errorDetails.message || "Unknown error"}${errorDetails.statusCode ? ` (Status: ${errorDetails.statusCode})` : ""}${errorDetails.path ? ` at ${errorDetails.path}` : ""}`;
            console.error("Throwing error:", errorMsg);
            throw new Error(errorMsg);
          }
          throw sendError instanceof Error ? sendError : new Error(String(sendError));
        }

        if (sendResult.status !== "SUCCESS") {
          throw new Error(sendResult.message || "Failed to send transaction");
        }

        // Extract contract ID from the sendResult response
        // The sendTransaction response includes contractId after successful submission
        const contractId =
          "contractId" in sendResult && typeof sendResult.contractId === "string"
            ? sendResult.contractId
            : "contractId" in deployResult && typeof deployResult.contractId === "string"
              ? deployResult.contractId
              : "";

        if (!contractId) {
          throw new Error(
            "Failed to get contract ID from escrow deployment. The contract may need to be queried from the indexer after transaction confirmation."
          );
        }

        console.log("Escrow created successfully with contract ID:", contractId);

        return {
          contractId,
          successful: true,
          hash: sendResult.message, // Transaction hash might be in message or separate field
        };
      } catch (err: unknown) {
        console.error("Escrow initialization error:", err);
        console.error("Error details:", JSON.stringify(err, null, 2));

        // Extract more detailed error information
        let errorMessage = "Failed to initialize escrow";
        let errorCode: string | undefined;

        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (err && typeof err === "object") {
          // Check for Trustless Work API error structure
          if ("message" in err) {
            errorMessage = String(err.message);
          }
          if ("statusCode" in err) {
            errorCode = String(err.statusCode);
          } else if ("code" in err) {
            errorCode = String(err.code);
          }

          // Check for nested error structures
          if ("response" in err && err.response && typeof err.response === "object") {
            if (
              "data" in err.response &&
              err.response.data &&
              typeof err.response.data === "object"
            ) {
              const responseData = err.response.data as Record<string, unknown>;
              if ("message" in responseData) {
                errorMessage = String(responseData.message);
              }
              if ("error" in responseData) {
                errorMessage = String(responseData.error);
              }
              if ("statusCode" in responseData) {
                errorCode = String(responseData.statusCode);
              }
            }
          }

          // Log full error object for debugging
          console.error("Full error object:", err);
        }

        const error: EscrowError = {
          message: errorMessage,
          code: errorCode,
        };
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [address, deployEscrow, signTransaction, sendTransaction]
  );

  const fundCampaignEscrow = useCallback(
    async (contractId: string, amount: number): Promise<EscrowResult> => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      setIsLoading(true);
      setError(null);

      try {
        const payload: FundEscrowPayload = {
          contractId,
          amount,
          signer: address,
        };

        console.log("Funding escrow with payload:", payload);

        // Get unsigned transaction - fundEscrow takes (payload, type)
        const fundResult = await fundEscrow(payload, "single-release");

        if (!fundResult || !fundResult.unsignedTransaction) {
          throw new Error("Failed to fund escrow: No unsigned transaction returned");
        }

        // Sign the transaction
        const signedXdr = await signTransaction(fundResult.unsignedTransaction);

        if (!signedXdr) {
          throw new Error("Failed to sign transaction");
        }

        // Send the signed transaction
        const sendResult = await sendTransaction(signedXdr);

        if (sendResult.status !== "SUCCESS") {
          throw new Error(sendResult.message || "Failed to send transaction");
        }

        return {
          contractId,
          successful: true,
          hash: sendResult.message,
        };
      } catch (err: unknown) {
        console.error("Fund escrow error:", err);

        const error: EscrowError = {
          message: err instanceof Error ? err.message : "Failed to fund escrow",
          code: err && typeof err === "object" && "code" in err ? String(err.code) : undefined,
        };
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [address, fundEscrow, signTransaction, sendTransaction]
  );

  const getEscrowDetails = useCallback(
    async (contractIds: string[]) => {
      try {
        const params: GetEscrowFromIndexerByContractIdsParams = {
          contractIds,
        };
        const result = await getEscrowByContractIds(params);
        return result;
      } catch (err: unknown) {
        console.error("Failed to get escrow details:", err);
        throw err;
      }
    },
    [getEscrowByContractIds]
  );

  return {
    initializeCampaignEscrow,
    fundCampaignEscrow,
    getEscrowDetails,
    isLoading,
    error,
    isConnected: !!address,
  };
}
