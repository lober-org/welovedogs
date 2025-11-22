"use client";

import { DollarSign, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  totalReceived: number;
  totalSpent: number;
}

export function StatsCards({ totalReceived, totalSpent }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 mt-6">
      <div className="flex items-center gap-3 rounded-lg bg-white border-2 border-green-200 p-4 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <DollarSign className="h-6 w-6 text-green-700" />
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Received</p>
          <p className="text-xl md:text-2xl font-bold text-gray-800">
            ${totalReceived.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-lg bg-white border-2 border-blue-200 p-4 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <TrendingUp className="h-6 w-6 text-blue-700" />
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Spent</p>
          <p className="text-xl md:text-2xl font-bold text-gray-800">
            ${totalSpent.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
