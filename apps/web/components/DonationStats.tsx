"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

type DonationStatsProps = {
  recipientAddress?: string;
  donorAddress?: string;
  className?: string;
};

type DonationRecord = {
  id: number;
  donor: string;
  recipient: string;
  amount: string;
  amountFormatted: string;
  asset: string;
  timestamp: string;
  memo?: string;
};

type StatsResponse = {
  ok: boolean;
  totalDonations?: number;
  recipientTotal?: {
    address: string;
    totalAmount: string;
    totalAmountFormatted: string;
  };
  recipientDonations?: DonationRecord[];
  donorDonations?: DonationRecord[];
  error?: string;
  hint?: string;
};

export function DonationStats({ recipientAddress, donorAddress, className }: DonationStatsProps) {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (recipientAddress) {
        params.append("recipient", recipientAddress);
      }
      if (donorAddress) {
        params.append("donor", donorAddress);
      }
      params.append("limit", "10");

      const response = await fetch(`/api/donation/stats?${params.toString()}`);
      const data = await response.json();
      setStats(data);
      if (!data.ok) {
        setError(data.error || "Failed to fetch stats");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (recipientAddress || donorAddress) {
      fetchStats();
    }
  }, [recipientAddress, donorAddress]);

  if (!recipientAddress && !donorAddress) {
    return null;
  }

  if (loading && !stats) {
    return (
      <div className={`rounded-xl border border-black/5 bg-white/90 p-6 ${className}`}>
        <p className="text-sm text-gray-600">Loading donation stats...</p>
      </div>
    );
  }

  if (error || (stats && !stats.ok)) {
    return (
      <div className={`rounded-xl border border-amber-200 bg-amber-50 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Donation Tracking Status</h3>
        <p className="text-sm text-amber-800 mb-2">
          {error || stats?.error || "Unable to load donation stats"}
        </p>
        {stats?.hint && <p className="text-xs text-amber-700">{stats.hint}</p>}
        <Button onClick={fetchStats} variant="outline" size="sm" className="mt-3">
          Retry
        </Button>
      </div>
    );
  }

  const donations = recipientAddress ? stats?.recipientDonations : stats?.donorDonations;

  return (
    <div className={`rounded-xl border border-black/5 bg-white/90 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Donation Tracking</h3>
        <Button onClick={fetchStats} variant="outline" size="sm" disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <div className="space-y-4">
        {stats?.totalDonations !== undefined && (
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Total Donations</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalDonations}</p>
          </div>
        )}

        {stats?.recipientTotal && (
          <div className="rounded-lg bg-indigo-50 p-3">
            <p className="text-xs text-indigo-600">Total Donated to Recipient</p>
            <p className="text-xl font-bold text-indigo-900">
              {stats.recipientTotal.totalAmountFormatted} USDC
            </p>
            <p className="text-xs text-indigo-600 mt-1 truncate">{stats.recipientTotal.address}</p>
          </div>
        )}

        {donations && donations.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Recent Donations ({donations.length})
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="rounded-lg border border-gray-200 bg-white p-3 text-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{donation.amountFormatted} USDC</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {recipientAddress
                          ? `From: ${donation.donor.slice(0, 8)}...`
                          : `To: ${donation.recipient.slice(0, 8)}...`}
                      </p>
                      {donation.memo && (
                        <p className="text-xs text-gray-600 mt-1 italic">"{donation.memo}"</p>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {donation.timestamp
                        ? new Date(Number(donation.timestamp) * 1000).toLocaleDateString()
                        : "—"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {donations && donations.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No donations found yet</p>
        )}
      </div>
    </div>
  );
}
