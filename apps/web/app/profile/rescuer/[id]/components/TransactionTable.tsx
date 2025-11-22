import type { Transaction } from "../types";

interface TransactionTableProps {
  transactions: Transaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b-2 border-gray-200 bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Details</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {transactions.map((tx, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-600">{tx.date}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                    tx.type === "donation"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {tx.type === "donation" ? "Donation" : "Expense"}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {tx.type === "donation" ? (
                  <div>
                    <div>{tx.crypto}</div>
                    <div className="text-xs text-gray-500">From: {tx.donor}</div>
                  </div>
                ) : (
                  <div>{tx.description}</div>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <span
                  className={`font-semibold ${
                    tx.type === "donation" ? "text-green-600" : "text-orange-600"
                  }`}
                >
                  {tx.type === "donation" ? "+" : "-"}${tx.amount}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
