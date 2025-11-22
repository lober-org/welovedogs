"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface TabHeaderProps {
  title: string;
  actions?: ReactNode;
}

export function TabHeader({ title, actions }: TabHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800">{title}</h2>
      {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
