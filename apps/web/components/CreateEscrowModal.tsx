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
import { AlertCircle, Loader2, Shield, Link2, CheckCircle2, Copy } from "lucide-react";
import { useEscrow } from "@/hooks/useEscrow";
import { useWalletsKit } from "@/hooks/useWalletsKit";
import { createBrowserClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface CreateEscrowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  dogName: string;
  careProviderAddress: string; // For approver/serviceProvider roles
  campaignStellarAddress: string; // For receiver role - this is the campaign's stellar_address field
  goal: number;
  existingEscrowId?: string | null; // Existing escrow ID if campaign already has one
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
  existingEscrowId,
  onSuccess,
}: CreateEscrowModalProps) {
  const { address, openModalAndConnect } = useWalletsKit();
  const { initializeCampaignEscrow, getEscrowDetails, isLoading, error } = useEscrow();
  const [platformAddress, setPlatformAddress] = useState("");
  const [disputeResolverAddress, setDisputeResolverAddress] = useState("");
  const [releaseSignerAddress, setReleaseSignerAddress] = useState("");
  const [platformFee, setPlatformFee] = useState("0.05");
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [contractId, setContractId] = useState<string | null>(null);
  const [mode, setMode] = useState<"create" | "link">("create");
  const [existingEscrowInput, setExistingEscrowInput] = useState("");
  const [validatingEscrow, setValidatingEscrow] = useState(false);

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
      setExistingEscrowInput(existingEscrowId || "");
      setMode(existingEscrowId ? "link" : "create");
    }
  }, [open, careProviderAddress, existingEscrowId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleLinkExistingEscrow = async () => {
    if (!existingEscrowInput.trim()) {
      toast.error("Please enter an escrow contract ID");
      setLocalError("Please enter an escrow contract ID");
      return;
    }

    setValidatingEscrow(true);
    setLocalError(null);

    const toastId = toast.loading("Validating escrow contract...", {
      description: "Checking if the escrow exists and belongs to this campaign",
    });

    try {
      // Validate the escrow exists and matches this campaign
      const escrowDetails = await getEscrowDetails([existingEscrowInput.trim()]);

      // Handle both array and single object responses
      const escrow = Array.isArray(escrowDetails) ? escrowDetails[0] : escrowDetails;

      if (!escrow) {
        throw new Error("Escrow contract not found. Please verify the contract ID.");
      }

      toast.loading("Verifying escrow details...", { id: toastId });

      // Verify the escrow's engagementId matches this campaign
      if (escrow.engagementId !== campaignId) {
        throw new Error(
          `This escrow belongs to a different campaign (engagementId: ${escrow.engagementId}). ` +
            `Expected engagementId: ${campaignId}`
        );
      }

      // Verify the receiver matches the campaign's stellar address
      if ("receiver" in escrow.roles && escrow.roles.receiver !== campaignStellarAddress) {
        throw new Error(
          `Escrow receiver address (${escrow.roles.receiver}) does not match campaign address (${campaignStellarAddress})`
        );
      }

      toast.loading("Linking escrow to campaign...", { id: toastId });

      // Store the escrow contract ID in database
      const supabase = createBrowserClient();
      const { error: dbError } = await supabase
        .from("campaigns")
        .update({ escrow_id: existingEscrowInput.trim() })
        .eq("id", campaignId);

      if (dbError) {
        throw new Error(`Failed to link escrow: ${dbError.message}`);
      }

      toast.success("Escrow linked successfully!", {
        id: toastId,
        description: "The escrow has been linked to this campaign",
      });

      setContractId(existingEscrowInput.trim());
      setSuccess(true);

      if (onSuccess) {
        onSuccess(existingEscrowInput.trim());
      }
    } catch (err) {
      console.error("Error linking escrow:", err);

      let errorMessage = "Failed to link escrow";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === "object" && "message" in err) {
        errorMessage = String(err.message);
      }

      toast.error("Failed to link escrow", {
        id: toastId,
        description: errorMessage,
      });

      setLocalError(errorMessage);
    } finally {
      setValidatingEscrow(false);
    }
  };

  const handleCreateEscrow = async () => {
    if (!address) {
      toast.error("Wallet not connected", {
        description: "Please connect your wallet to create an escrow",
      });
      setLocalError("Please connect your wallet first");
      await openModalAndConnect();
      return;
    }

    if (!careProviderAddress) {
      toast.error("Missing information", {
        description: "Care provider address is required",
      });
      setLocalError("Care provider address is required");
      return;
    }

    if (!campaignStellarAddress) {
      toast.error("Missing information", {
        description: "Campaign stellar address is required",
      });
      setLocalError("Campaign stellar address is required");
      return;
    }

    setLocalError(null);

    const fee = parseFloat(platformFee);
    if (Number.isNaN(fee) || fee < 0 || fee > 1) {
      const errorMsg = "Platform fee must be between 0 and 1 (e.g., 0.05 for 5%)";
      toast.error("Invalid platform fee", {
        description: errorMsg,
      });
      setLocalError(errorMsg);
      return;
    }

    const toastId = toast.loading("Creating escrow contract...", {
      description: "This may take a few moments. Please don't close this window.",
    });

    try {
      toast.loading("Deploying escrow contract...", {
        id: toastId,
        description: "Preparing the transaction",
      });

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
        toast.loading("Saving escrow to database...", {
          id: toastId,
          description: "Almost done!",
        });

        // Store escrow contract ID in database
        try {
          const supabase = createBrowserClient();
          const { error: dbError } = await supabase
            .from("campaigns")
            .update({ escrow_id: result.contractId })
            .eq("id", campaignId);

          if (dbError) {
            console.error("Error storing escrow contract ID:", dbError);
            toast.warning("Escrow created but database update failed", {
              id: toastId,
              description: "The escrow was created on-chain but couldn't be saved to the database",
            });
          } else {
            toast.success("Escrow created successfully!", {
              id: toastId,
              description: `Contract ID: ${result.contractId.substring(0, 8)}...`,
              duration: 5000,
            });
          }
        } catch (dbError) {
          console.error("Error storing escrow contract ID:", dbError);
          toast.warning("Escrow created but database update failed", {
            id: toastId,
            description: "The escrow was created on-chain but couldn't be saved to the database",
          });
        }

        setContractId(result.contractId);
        setSuccess(true);

        if (onSuccess) {
          onSuccess(result.contractId);
        }
      }
    } catch (err) {
      console.error("Error creating escrow:", err);

      let errorMessage = "Failed to create escrow";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === "object" && "message" in err) {
        errorMessage = String(err.message);
      }

      toast.error("Failed to create escrow", {
        id: toastId,
        description: errorMessage,
        duration: 6000,
      });

      setLocalError(errorMessage);
    }
  };

  const displayError = localError || error?.message;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-5 w-5 text-primary" />
            {existingEscrowId ? "Manage Escrow" : "Create Escrow"}
            <span className="text-muted-foreground font-normal">for {dogName}'s Campaign</span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            {existingEscrowId
              ? "This campaign already has an escrow account. You can link a different one or create a new one."
              : "Set up an escrow account to securely hold donations until proof of expenses is provided."}
          </DialogDescription>
        </DialogHeader>

        {success && contractId ? (
          <div className="space-y-6 py-4">
            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                    {mode === "link"
                      ? "Escrow linked successfully!"
                      : "Escrow created successfully!"}
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    The escrow has been {mode === "link" ? "linked" : "created"} and saved to your
                    campaign.
                  </p>
                </div>
                <div className="h-px bg-green-200 dark:bg-green-800 my-3" />
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-green-900 dark:text-green-100">
                    Contract ID
                  </Label>
                  <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded border border-green-200 dark:border-green-800">
                    <p className="font-mono text-xs break-all flex-1">{contractId}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => copyToClipboard(contractId)}
                      title="Copy to clipboard"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            {displayError && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">Error</p>
                  <p className="text-sm text-red-800 dark:text-red-200 mt-1">{displayError}</p>
                </div>
              </div>
            )}

            {existingEscrowId && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Current Escrow Account
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <p className="font-mono text-xs break-all text-blue-800 dark:text-blue-200">
                        {existingEscrowId}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(existingEscrowId)}
                        title="Copy to clipboard"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                      This campaign already has an escrow account. You can link a different one or
                      create a new one.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Tabs
              value={mode}
              onValueChange={(value) => setMode(value as "create" | "link")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="create" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Create New
                </TabsTrigger>
                <TabsTrigger value="link" className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Link Existing
                </TabsTrigger>
              </TabsList>

              <TabsContent value="link" className="space-y-6 mt-0">
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <div className="flex items-start gap-2">
                      <Link2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Link Existing Escrow</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Enter the contract ID of an existing escrow that belongs to this campaign.
                          The escrow will be validated to ensure it matches this campaign.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="existing-escrow-id" className="text-sm font-medium">
                      Escrow Contract ID <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="existing-escrow-id"
                      value={existingEscrowInput}
                      onChange={(e) => setExistingEscrowInput(e.target.value)}
                      placeholder="CCDHLDL2TC7M3D7WGDYDA54A6E5EPJ66MNQQ2VDA2PTRAWFOAZWDXJFZ"
                      className="font-mono text-sm"
                      disabled={validatingEscrow}
                    />
                    <p className="text-xs text-muted-foreground">
                      Paste the full contract ID of the escrow you want to link
                    </p>
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={validatingEscrow}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleLinkExistingEscrow}
                    disabled={validatingEscrow || !existingEscrowInput.trim()}
                    className="min-w-[120px]"
                  >
                    {validatingEscrow ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <Link2 className="mr-2 h-4 w-4" />
                        Link Escrow
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </TabsContent>

              <TabsContent value="create" className="space-y-6 mt-0">
                {!address && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                          Wallet Required
                        </p>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                          Please connect your wallet to create an escrow contract on the blockchain.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Campaign Information</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="campaign-stellar-address" className="text-sm">
                            Campaign Stellar Address (Receiver)
                          </Label>
                          <Input
                            id="campaign-stellar-address"
                            value={campaignStellarAddress}
                            disabled
                            className="mt-1.5 font-mono text-sm"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            This address will receive the funds when released
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="care-provider-address" className="text-sm">
                            Care Provider Address (Approver)
                          </Label>
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
                      </div>
                    </div>

                    <div className="h-px bg-border my-4" />

                    <div>
                      <h3 className="text-sm font-semibold mb-3">Escrow Configuration</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="platform-address" className="text-sm">
                            Platform Address{" "}
                            <span className="text-muted-foreground font-normal">(Optional)</span>
                          </Label>
                          <Input
                            id="platform-address"
                            value={platformAddress}
                            onChange={(e) => setPlatformAddress(e.target.value)}
                            placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                            className="mt-1.5 font-mono text-sm"
                            disabled={isLoading}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Platform address for escrow management
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="dispute-resolver-address" className="text-sm">
                            Dispute Resolver Address{" "}
                            <span className="text-muted-foreground font-normal">(Optional)</span>
                          </Label>
                          <Input
                            id="dispute-resolver-address"
                            value={disputeResolverAddress}
                            onChange={(e) => setDisputeResolverAddress(e.target.value)}
                            placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                            className="mt-1.5 font-mono text-sm"
                            disabled={isLoading}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Address authorized to resolve disputes
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="release-signer-address" className="text-sm">
                            Release Signer Address{" "}
                            <span className="text-muted-foreground font-normal">(Optional)</span>
                          </Label>
                          <Input
                            id="release-signer-address"
                            value={releaseSignerAddress}
                            onChange={(e) => setReleaseSignerAddress(e.target.value)}
                            placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                            className="mt-1.5 font-mono text-sm"
                            disabled={isLoading}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Address authorized to release funds
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="platform-fee" className="text-sm">
                            Platform Fee
                          </Label>
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
                            disabled={isLoading}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Platform fee as a decimal (e.g., 0.05 for 5%)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-border my-4" />

                    <div className="space-y-3">
                      <div className="p-4 bg-muted/50 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Campaign Goal</span>
                          <span className="text-lg font-semibold">${goal.toLocaleString()}</span>
                        </div>
                      </div>

                      {process.env.NEXT_PUBLIC_TRUSTLINE_ADDRESS && (
                        <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-purple-900 dark:text-purple-100">
                                Trustline Address
                              </p>
                              <p className="font-mono text-[10px] break-all text-purple-800 dark:text-purple-200 mt-1">
                                {process.env.NEXT_PUBLIC_TRUSTLINE_ADDRESS}
                              </p>
                              <p className="text-[10px] text-purple-700 dark:text-purple-300 mt-1">
                                Using configured trustline address from environment
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCreateEscrow}
                    disabled={isLoading || !address}
                    className="min-w-[140px]"
                  >
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
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
