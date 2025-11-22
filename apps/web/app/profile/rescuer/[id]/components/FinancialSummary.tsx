import { TrendingUp, DollarSign } from "lucide-react";

interface FinancialSummaryProps {
  totalReceived: number;
  totalSpent: number;
}

export function FinancialSummary({ totalReceived, totalSpent }: FinancialSummaryProps) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-2">
      <div className="rounded-lg bg-green-50 p-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-green-600" />
          <div>
            <p className="text-sm text-gray-600">Total Received</p>
            <p className="text-2xl font-bold text-green-600">${totalReceived.toLocaleString()}</p>
          </div>
        </div>
      </div>
      <div className="rounded-lg bg-orange-50 p-4">
        <div className="flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-orange-600" />
          <div>
            <p className="text-sm text-gray-600">Total Spent</p>
            <p className="text-2xl font-bold text-orange-600">${totalSpent.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
