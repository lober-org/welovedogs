"use client";

import React from "react";
import { development, mainNet, TrustlessWorkConfig } from "@trustless-work/escrow";
import { getConfig } from "@/lib/config";

interface TrustlessWorkProviderProps {
  children: React.ReactNode;
}

export function TrustlessWorkProvider({ children }: TrustlessWorkProviderProps) {
  const cfg = getConfig();
  const apiKey = process.env.NEXT_PUBLIC_TRUSTLESS_WORK_API_KEY || "";

  // Use development for testnet, mainNet for production
  const baseURL = cfg.stellarNetwork === "testnet" ? development : mainNet;

  if (!apiKey) {
    console.warn("Trustless Work API key not configured. Escrow functionality will be limited.");
  }

  return (
    <TrustlessWorkConfig baseURL={baseURL} apiKey={apiKey}>
      {children}
    </TrustlessWorkConfig>
  );
}
