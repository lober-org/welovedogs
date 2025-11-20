"use client";

import { useCallback, useState } from "react";
import {
  useInitializeEscrow,
  useFundEscrow,
  useGetEscrowFromIndexerByContractIds,
} from "@trustless-work/escrow/hooks";
import { useWalletsKit } from "./useWalletsKit";
import type { InitializeEscrowParams, FundEscrowParams } from "@trustless-work/escrow/types";

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

  const { initializeEscrow } = useInitializeEscrow();
  const { fundEscrow } = useFundEscrow();
  const { getEscrowFromIndexerByContractIds } = useGetEscrowFromIndexerByContractIds();

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
        const params: InitializeEscrowParams = {
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
            address: address, // Donor's address for trustline
          },
          receiverMemo: 0,
          flags: {
            approved: false,
            released: false,
            disputed: false,
            resolved: false,
          },
        };

        const result = await initializeEscrow(params);

        if (!result || !result.contractId) {
          throw new Error("Failed to initialize escrow");
        }

        return {
          contractId: result.contractId,
          successful: true,
          hash: result.hash,
        };
      } catch (err: unknown) {
        const error: EscrowError = {
          message: err instanceof Error ? err.message : "Failed to initialize escrow",
          code: err && typeof err === "object" && "code" in err ? String(err.code) : undefined,
        };
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [address, initializeEscrow]
  );

  const fundCampaignEscrow = useCallback(
    async (contractId: string, amount: number): Promise<EscrowResult> => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      setIsLoading(true);
      setError(null);

      try {
        const params: FundEscrowParams = {
          contractId,
          amount,
        };

        const result = await fundEscrow(params);

        if (!result || !result.successful) {
          throw new Error("Failed to fund escrow");
        }

        return {
          contractId,
          successful: true,
          hash: result.hash,
        };
      } catch (err: unknown) {
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
    [address, fundEscrow]
  );

  const getEscrowDetails = useCallback(
    async (contractIds: string[]) => {
      try {
        const result = await getEscrowFromIndexerByContractIds({
          contractIds,
        });
        return result;
      } catch (err: unknown) {
        console.error("Failed to get escrow details:", err);
        throw err;
      }
    },
    [getEscrowFromIndexerByContractIds]
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
