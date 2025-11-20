import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Expense } from "./types";

interface ExpenseReportProps {
  expenses: Expense[];
}

export function ExpenseReport({ expenses }: ExpenseReportProps) {
  if (expenses.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/30 p-8 text-center">
        <p className="text-muted-foreground">
          No expenses have been reported yet for this campaign.
        </p>
      </div>
    );
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-2 md:space-y-3">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="flex items-center justify-between rounded-lg border bg-card p-4"
        >
          <div className="flex-1">
            <div className="font-semibold text-foreground">{expense.title}</div>
            {expense.description && (
              <div className="text-sm text-muted-foreground mt-1">{expense.description}</div>
            )}
            <div className="text-xs text-muted-foreground mt-1">{expense.date}</div>
          </div>
          <div className="text-right flex items-center gap-3">
            <div>
              <div className="font-bold text-foreground">${expense.amount.toLocaleString()}</div>
              <div className="text-sm text-emerald-600">Paid</div>
            </div>
            {expense.proof && (
              <a href={expense.proof} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        </div>
      ))}

      <div className="mt-4 rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center justify-between">
          <span className="font-bold text-foreground">Total Expenses:</span>
          <span className="text-2xl font-bold text-primary">${totalExpenses.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
