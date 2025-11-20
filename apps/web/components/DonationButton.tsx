"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useDonation } from "@/hooks/useDonation";
import { useWalletsKit } from "@/hooks/useWalletsKit";

type DonationButtonProps = {
  recipientAddress: string;
  recipientName?: string;
  defaultAmount?: string;
  className?: string;
};

export function DonationButton({
  recipientAddress,
  recipientName,
  defaultAmount = "10",
  className,
}: DonationButtonProps) {
  const { isConnected, openModalAndConnect } = useWalletsKit();
  const { donate, isLoading, error } = useDonation();
  const [amount, setAmount] = useState(defaultAmount);
  const [memo, setMemo] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDonate = useCallback(async () => {
    if (!isConnected) {
      await openModalAndConnect();
      return;
    }

    if (!recipientAddress) {
      alert("Recipient address is not configured. Please contact the campaign organizer.");
      return;
    }

    try {
      setSuccess(null);
      const result = await donate(recipientAddress, amount, memo || undefined);
      setSuccess(`Donation successful! Transaction: ${result.hash.slice(0, 8)}...`);
      setShowForm(false);
      setAmount(defaultAmount);
      setMemo("");

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      // Error is handled by the hook
      console.error("Donation error:", err);
    }
  }, [isConnected, openModalAndConnect, donate, recipientAddress, amount, memo, defaultAmount]);

  if (showForm) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="space-y-2">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount (USDC)
          </label>
          <input
            id="amount"
            type="number"
            step="0.1"
            min="0.1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="10.0"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="memo" className="block text-sm font-medium text-gray-700">
            Memo (Optional)
          </label>
          <input
            id="memo"
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Add a note..."
            disabled={isLoading}
            maxLength={28}
          />
          <p className="text-xs text-gray-500">Maximum 28 characters</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
            {error.message}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
            {success}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleDonate}
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
            className="flex-1"
          >
            {isLoading ? "Processing..." : `Donate ${amount} USDC`}
          </Button>
          <Button
            onClick={() => {
              setShowForm(false);
              setSuccess(null);
            }}
            variant="outline"
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Button
        onClick={() => {
          if (!isConnected) {
            openModalAndConnect();
          } else if (!recipientAddress) {
            alert("Recipient address is not configured. Please contact the campaign organizer.");
          } else {
            setShowForm(true);
          }
        }}
        className="w-full"
        disabled={!recipientAddress}
      >
        {isConnected ? "Donate USDC" : "Connect Wallet to Donate"}
      </Button>
      {success && (
        <div className="mt-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}
    </div>
  );
}
