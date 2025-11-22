"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { useWalletsKit } from "@/hooks/useWalletsKit";
import { createBrowserClient } from "@/lib/supabase/client";

export function WalletConnection() {
  const [savingWallet, setSavingWallet] = useState(false);
  const { address, openModalAndConnect, disconnect, isConnected } = useWalletsKit();
  const supabase = createBrowserClient();

  const handleSaveAddress = async () => {
    if (!address) return;
    setSavingWallet(true);
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) return;

      const { error } = await supabase
        .from("care_providers")
        .update({ stellar_address: address })
        .eq("auth_user_id", authUser.id);

      if (error) {
        console.error("Error saving wallet address:", error);
        alert("Failed to save wallet address. Please try again.");
      } else {
        alert("Wallet address saved successfully!");
      }
    } catch (err) {
      console.error("Error saving wallet:", err);
      alert("Failed to save wallet address. Please try again.");
    } finally {
      setSavingWallet(false);
    }
  };

  return (
    <div className="mt-6 p-4 bg-white rounded-lg border-2 border-purple-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Wallet className="h-4 w-4 text-purple-600" />
          Stellar Wallet
        </h3>
      </div>
      {isConnected ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-600 mb-1">Connected Address</div>
              <div className="text-sm font-mono break-all text-gray-800">{address}</div>
            </div>
            <CopyButton value={address || ""} />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={handleSaveAddress}
              disabled={savingWallet}
            >
              {savingWallet ? "Saving..." : "Save Address"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={disconnect}
            >
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-600">
            Connect your Stellar wallet to save your address for campaigns
          </p>
          <Button
            type="button"
            variant="default"
            size="sm"
            className="w-full text-xs"
            onClick={openModalAndConnect}
          >
            <Wallet className="h-3 w-3 mr-1.5" />
            Connect Wallet
          </Button>
        </div>
      )}
    </div>
  );
}
