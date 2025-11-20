import { useState, useEffect, useRef, useMemo } from "react";
import { useEscrow } from "@/hooks/useEscrow";
import { useGetMultipleEscrowBalances } from "@trustless-work/escrow/hooks";
import { createBrowserClient } from "@/lib/supabase/client";

export interface CampaignBalance {
  campaignId: string;
  escrowContractId: string | null;
  escrowBalance: number;
  stellarAddress: string | null;
  isLoading: boolean;
}

export interface UseCampaignBalancesOptions {
  campaignIds: string[];
  enabled?: boolean;
}

type CampaignData = {
  id: string;
  escrow_id: string | null;
  stellar_address: string | null;
};

/**
 * Hook to fetch escrow balances for multiple campaigns
 */
export function useCampaignBalances({ campaignIds, enabled = true }: UseCampaignBalancesOptions) {
  const [balances, setBalances] = useState<Map<string, CampaignBalance>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const { getEscrowDetails } = useEscrow();
  const { getMultipleBalances } = useGetMultipleEscrowBalances();

  const getMultipleBalancesRef = useRef(getMultipleBalances);
  const getEscrowDetailsRef = useRef(getEscrowDetails);

  useEffect(() => {
    getMultipleBalancesRef.current = getMultipleBalances;
    getEscrowDetailsRef.current = getEscrowDetails;
  }, [getMultipleBalances, getEscrowDetails]);

  useEffect(() => {
    if (!enabled || campaignIds.length === 0) {
      setBalances(new Map());
      return;
    }

    const fetchBalances = async () => {
      setIsLoading(true);
      try {
        const supabase = createBrowserClient();

        // Fetch campaign data (escrow_id and stellar_address) for all campaigns
        const { data: campaigns } = await supabase
          .from("campaigns")
          .select("id, escrow_id, stellar_address")
          .in("id", campaignIds);

        if (!campaigns) {
          setIsLoading(false);
          return;
        }

        // Initialize balances map
        const balancesMap = new Map<string, CampaignBalance>();

        // Set initial state for all campaigns
        campaigns.forEach((campaign: CampaignData) => {
          balancesMap.set(campaign.id, {
            campaignId: campaign.id,
            escrowContractId: campaign.escrow_id || null,
            escrowBalance: 0,
            stellarAddress: campaign.stellar_address || null,
            isLoading: true,
          });
        });

        setBalances(balancesMap);

        // Fetch escrow balances for campaigns that have escrow contracts
        const escrowContractIds = campaigns
          .map((c: CampaignData) => c.escrow_id)
          .filter((id: string | null): id is string => !!id);

        if (escrowContractIds.length > 0) {
          try {
            const escrowBalances = await getMultipleBalancesRef.current({
              addresses: escrowContractIds,
            });

            if (Array.isArray(escrowBalances)) {
              escrowContractIds.forEach((contractId: string, index: number) => {
                const balanceData = escrowBalances[index];
                if (
                  balanceData &&
                  "balance" in balanceData &&
                  typeof balanceData.balance === "number"
                ) {
                  // Find campaign with this escrow_id
                  const campaign = campaigns.find((c: CampaignData) => c.escrow_id === contractId);
                  if (campaign) {
                    const currentBalance = balancesMap.get(campaign.id);
                    if (currentBalance) {
                      balancesMap.set(campaign.id, {
                        ...currentBalance,
                        escrowBalance: balanceData.balance,
                        isLoading: false,
                      });
                    }
                  }
                } else {
                  // Mark as loaded even if balance is 0 or invalid
                  const campaign = campaigns.find((c: CampaignData) => c.escrow_id === contractId);
                  if (campaign) {
                    const currentBalance = balancesMap.get(campaign.id);
                    if (currentBalance) {
                      balancesMap.set(campaign.id, {
                        ...currentBalance,
                        isLoading: false,
                      });
                    }
                  }
                }
              });
            }
          } catch (balanceError) {
            console.error("Error fetching escrow balances:", balanceError);
            // Try fallback method
            try {
              const escrowDetails = await getEscrowDetailsRef.current(escrowContractIds);
              const detailsArray = Array.isArray(escrowDetails) ? escrowDetails : [escrowDetails];

              escrowContractIds.forEach((contractId: string) => {
                const escrow = detailsArray.find(
                  (e: any) => e?.contractId === contractId || e?.id === contractId
                );
                if (escrow && "balance" in escrow && typeof escrow.balance === "number") {
                  const campaign = campaigns.find((c: CampaignData) => c.escrow_id === contractId);
                  if (campaign) {
                    const currentBalance = balancesMap.get(campaign.id);
                    if (currentBalance) {
                      balancesMap.set(campaign.id, {
                        ...currentBalance,
                        escrowBalance: escrow.balance,
                        isLoading: false,
                      });
                    }
                  }
                } else {
                  // Mark as loaded even if balance fetch failed
                  const campaign = campaigns.find((c: CampaignData) => c.escrow_id === contractId);
                  if (campaign) {
                    const currentBalance = balancesMap.get(campaign.id);
                    if (currentBalance) {
                      balancesMap.set(campaign.id, {
                        ...currentBalance,
                        isLoading: false,
                      });
                    }
                  }
                }
              });
            } catch (detailsError) {
              console.error("Error fetching escrow details:", detailsError);
            }
          }
        }

        // Mark campaigns without escrow as loaded
        campaigns.forEach((campaign: CampaignData) => {
          if (!campaign.escrow_id) {
            balancesMap.set(campaign.id, {
              ...balancesMap.get(campaign.id)!,
              isLoading: false,
            });
          }
        });

        setBalances(new Map(balancesMap));
      } catch (error) {
        console.error("Error fetching campaign balances:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();
  }, [campaignIds, enabled]);

  const getBalance = useMemo(() => {
    return (campaignId: string): CampaignBalance | null => {
      return balances.get(campaignId) || null;
    };
  }, [balances]);

  return {
    balances,
    getBalance,
    isLoading,
  };
}
