"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, Shield } from "lucide-react";
import { useEscrow } from "@/hooks/useEscrow";
import { useWalletsKit } from "@/hooks/useWalletsKit";
import { createBrowserClient } from "@/lib/supabase/client";

interface CreateEscrowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  dogName: string;
  careProviderAddress: string; // For approver/serviceProvider roles
  campaignStellarAddress: string; // For receiver role - this is the campaign's stellar_address field
  goal: number;
  onSuccess?: (contractId: string) => void;
}

export function CreateEscrowModal({
  open,
  onOpenChange,
  campaignId,
  dogName,
  careProviderAddress,
  campaignStellarAddress,
  goal,
  onSuccess,
}: CreateEscrowModalProps) {
  const { address, openModalAndConnect } = useWalletsKit();
  const { initializeCampaignEscrow, isLoading, error } = useEscrow();
  const [platformAddress, setPlatformAddress] = useState("");
  const [disputeResolverAddress, setDisputeResolverAddress] = useState("");
  const [releaseSignerAddress, setReleaseSignerAddress] = useState("");
  const [platformFee, setPlatformFee] = useState("0.05");
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [contractId, setContractId] = useState<string | null>(null);

  // Load default addresses from environment or use care provider address as fallback
  useEffect(() => {
    if (open) {
      setPlatformAddress(process.env.NEXT_PUBLIC_PLATFORM_ADDRESS || careProviderAddress);
      setDisputeResolverAddress(
        process.env.NEXT_PUBLIC_DISPUTE_RESOLVER_ADDRESS || careProviderAddress
      );
      setReleaseSignerAddress(
        process.env.NEXT_PUBLIC_RELEASE_SIGNER_ADDRESS || careProviderAddress
      );
      setLocalError(null);
      setSuccess(false);
      setContractId(null);
    }
  }, [open, careProviderAddress]);

  const handleCreateEscrow = async () => {
    if (!address) {
      setLocalError("Please connect your wallet first");
      await openModalAndConnect();
      return;
    }

    if (!careProviderAddress) {
      setLocalError("Care provider address is required");
      return;
    }

    if (!campaignStellarAddress) {
      setLocalError("Campaign stellar address is required");
      return;
    }

    setLocalError(null);

    try {
      const fee = parseFloat(platformFee);
      if (isNaN(fee) || fee < 0 || fee > 1) {
        throw new Error("Platform fee must be between 0 and 1 (e.g., 0.05 for 5%)");
      }

      const result = await initializeCampaignEscrow(
        campaignId,
        dogName,
        careProviderAddress, // Used for approver/serviceProvider
        campaignStellarAddress, // Used for receiver - campaign's stellar_address
        platformAddress,
        disputeResolverAddress,
        releaseSignerAddress,
        goal,
        fee
      );

      if (result.successful && result.contractId) {
        setContractId(result.contractId);
        setSuccess(true);

        // Store escrow contract ID in database
        try {
          const supabase = createBrowserClient();
          await supabase
            .from("campaigns")
            .update({ escrow_contract_id: result.contractId })
            .eq("id", campaignId);
        } catch (dbError) {
          console.error("Error storing escrow contract ID:", dbError);
          // Continue even if DB update fails
        }

        if (onSuccess) {
          onSuccess(result.contractId);
        }
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to create escrow");
    }
  };

  const displayError = localError || error?.message;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Create Escrow for {dogName}'s Campaign
          </DialogTitle>
          <DialogDescription>
            Set up an escrow account to securely hold donations until proof of expenses is provided.
          </DialogDescription>
        </DialogHeader>

        {success && contractId ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-semibold text-green-900 mb-2">
                Escrow created successfully!
              </p>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Contract ID</Label>
                  <p className="font-mono text-sm break-all">{contractId}</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            {displayError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{displayError}</p>
              </div>
            )}

            {!address && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Please connect your wallet to create an escrow
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="campaign-stellar-address">
                  Campaign Stellar Address (Receiver)
                </Label>
                <Input
                  id="campaign-stellar-address"
                  value={campaignStellarAddress}
                  disabled
                  className="mt-1.5 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This address will receive the funds when released (from campaign's stellar_address
                  field)
                </p>
              </div>

              <div>
                <Label htmlFor="care-provider-address">Care Provider Address (Approver)</Label>
                <Input
                  id="care-provider-address"
                  value={careProviderAddress}
                  disabled
                  className="mt-1.5 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This address will approve milestones and act as service provider
                </p>
              </div>

              <div>
                <Label htmlFor="platform-address">
                  Platform Address <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                  id="platform-address"
                  value={platformAddress}
                  onChange={(e) => setPlatformAddress(e.target.value)}
                  placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  className="mt-1.5 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Platform address for escrow management
                </p>
              </div>

              <div>
                <Label htmlFor="dispute-resolver-address">
                  Dispute Resolver Address <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                  id="dispute-resolver-address"
                  value={disputeResolverAddress}
                  onChange={(e) => setDisputeResolverAddress(e.target.value)}
                  placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  className="mt-1.5 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Address authorized to resolve disputes
                </p>
              </div>

              <div>
                <Label htmlFor="release-signer-address">
                  Release Signer Address <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                  id="release-signer-address"
                  value={releaseSignerAddress}
                  onChange={(e) => setReleaseSignerAddress(e.target.value)}
                  placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  className="mt-1.5 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Address authorized to release funds
                </p>
              </div>

              <div>
                <Label htmlFor="platform-fee">Platform Fee</Label>
                <Input
                  id="platform-fee"
                  type="number"
                  value={platformFee}
                  onChange={(e) => setPlatformFee(e.target.value)}
                  placeholder="0.05"
                  min="0"
                  max="1"
                  step="0.01"
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Platform fee as a decimal (e.g., 0.05 for 5%)
                </p>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Campaign Goal:</strong> ${goal.toLocaleString()}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleCreateEscrow} disabled={isLoading || !address}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Create Escrow
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
