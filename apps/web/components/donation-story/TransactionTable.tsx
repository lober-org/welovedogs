import { Shield, Zap, ExternalLink } from "lucide-react";
import { truncateAddress } from "./utils";
import type { Transaction } from "./types";

interface TransactionTableProps {
  transactions: Transaction[];
  sortBy: "date" | "amount";
  sortOrder: "asc" | "desc";
  onSort: (column: "date" | "amount") => void;
  isLoading: boolean;
}

export function TransactionTable({
  transactions,
  sortBy,
  sortOrder,
  onSort,
  isLoading,
}: TransactionTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-muted/30 p-8 text-center">
        <p className="text-muted-foreground">Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/30 p-8 text-center">
        <p className="text-muted-foreground">No transactions yet. Be the first to donate!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[600px]">
        <thead className="bg-muted">
          <tr>
            <th
              className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-foreground hover:bg-muted/80"
              onClick={() => onSort("date")}
            >
              Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Type</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
              Crypto Amount
            </th>
            <th
              className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-foreground hover:bg-muted/80"
              onClick={() => onSort("amount")}
            >
              USD Value {sortBy === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Donor</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">TX Hash</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">View</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, index) => (
            <tr key={`${tx.txHash}-${index}`} className="border-t hover:bg-muted/50">
              <td className="px-4 py-3 text-sm text-foreground">{tx.date}</td>
              <td className="px-4 py-3 text-sm">
                {tx.type === "escrow" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700">
                    <Shield className="h-3 w-3" />
                    Escrow
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    <Zap className="h-3 w-3" />
                    Instant
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-foreground">
                {tx.cryptoAmount} {tx.tokenSymbol}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-foreground">
                $
                {tx.usdValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
                {truncateAddress(tx.donor)}
              </td>
              <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
                {truncateAddress(tx.txHash)}
              </td>
              <td className="px-4 py-3 text-center">
                <a
                  href={tx.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center text-primary hover:text-primary/80"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
