"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Route } from "next";

interface EmptyStateProps {
  message: string;
  actionLabel: string;
  actionHref: Route;
}

export function EmptyState({ message, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="py-12 text-center text-gray-500">
      <p>{message}</p>
      <Link href={actionHref}>
        <Button className="mt-4 bg-purple-600 hover:bg-purple-700">{actionLabel}</Button>
      </Link>
    </div>
  );
}
