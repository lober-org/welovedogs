"use client";
import { SupabaseProvider } from "@/contexts/SupabaseContext";
import { SorobanProvider } from "@/contexts/SorobanContext";
import { WalletsKitProvider } from "@/contexts/WalletsKitContext";
import { TrustlessWorkProvider } from "@/contexts/TrustlessWorkContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <SorobanProvider>
        <WalletsKitProvider>
          <TrustlessWorkProvider>{children}</TrustlessWorkProvider>
        </WalletsKitProvider>
      </SorobanProvider>
    </SupabaseProvider>
  );
}
