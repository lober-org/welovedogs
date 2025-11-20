"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useDonation } from "@/hooks/useDonation";
import { useWalletsKit } from "@/hooks/useWalletsKit";

type DonationModalProps = {
  recipientAddress?: string;
  recipientName?: string;
  defaultAmount?: string;
  onClose?: () => void;
};

export function DonationModal({
  recipientAddress,
  recipientName,
  defaultAmount = "10",
  onClose,
}: DonationModalProps) {
  const { isConnected, openModalAndConnect } = useWalletsKit();
  const { donate, isLoading, error } = useDonation();
  const [amount, setAmount] = useState(defaultAmount);
  const [memo, setMemo] = useState("");
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
      setAmount(defaultAmount);
      setMemo("");

      // Clear success message and close after 3 seconds
      setTimeout(() => {
        setSuccess(null);
        if (onClose) onClose();
      }, 3000);
    } catch (err) {
      // Error is handled by the hook
      console.error("Donation error:", err);
    }
  }, [
    isConnected,
    openModalAndConnect,
    donate,
    recipientAddress,
    amount,
    memo,
    defaultAmount,
    onClose,
  ]);

  const handleClose = useCallback(() => {
    if (!isLoading && onClose) {
      onClose();
    }
  }, [isLoading, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-xl">
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          aria-label="Close"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Make a Donation</h2>
            {recipientName && (
              <p className="mt-1 text-sm text-gray-600">Supporting: {recipientName}</p>
            )}
          </div>

          {!isConnected ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Connect your wallet to make a donation in USDC.
              </p>
              <Button
                onClick={openModalAndConnect}
                className="w-full bg-gradient-to-r from-indigo-600 to-fuchsia-500 text-white"
              >
                Connect Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
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

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleDonate}
                  disabled={isLoading || !amount || parseFloat(amount) <= 0 || !recipientAddress}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-fuchsia-500 text-white"
                >
                  {isLoading ? "Processing..." : `Donate ${amount} USDC`}
                </Button>
                <Button onClick={handleClose} variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {!recipientAddress && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              ⚠️ Recipient address is not configured. Please set
              NEXT_PUBLIC_DEFAULT_DONATION_RECIPIENT or add recipient_address to campaign metadata.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
