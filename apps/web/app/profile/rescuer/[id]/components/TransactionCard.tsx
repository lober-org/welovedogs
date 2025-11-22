import type { Transaction } from "../types";

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction: tx }: TransactionCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-gray-600">{tx.date}</span>
        <span
          className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
            tx.type === "donation" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
          }`}
        >
          {tx.type === "donation" ? "Donation" : "Expense"}
        </span>
      </div>
      <div className="text-sm text-gray-700 mb-1">
        {tx.type === "donation" ? (
          <>
            <div>{tx.crypto}</div>
            <div className="text-xs text-gray-500">From: {tx.donor}</div>
          </>
        ) : (
          tx.description
        )}
      </div>
      <div
        className={`text-right font-semibold ${
          tx.type === "donation" ? "text-green-600" : "text-orange-600"
        }`}
      >
        {tx.type === "donation" ? "+" : "-"}${tx.amount}
      </div>
    </div>
  );
}
