"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useWalletsKitContext } from "@/contexts/WalletsKitContext";

export type PodToken = {
  tokenId: number;
  tokenUri: string | null;
};

type PodMetadata = {
  name: string;
  symbol: string;
  totalSupply: number;
};

type SuccessResponse<T> = { ok: true } & T & Record<string, unknown>;
type ErrorResponse = { ok: false; error: string };
type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

async function fetchJson<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const data = (await response.json().catch(() => ({}))) as Partial<ApiResponse<T>>;
  if (!response.ok || !data || data.ok === false) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as ErrorResponse).error === "string"
        ? (data as ErrorResponse).error
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return data as SuccessResponse<T>;
}

export function usePodPoap() {
  const { refreshAddress } = useWalletsKitContext();
  const [address, setAddress] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<PodMetadata | null>(null);
  const [tokens, setTokens] = useState<PodToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureAddress = useCallback(async () => {
    const current = await refreshAddress();
    if (!current) {
      throw new Error("Connecta una wallet para continuar.");
    }
    setAddress(current);
    return current;
  }, [refreshAddress]);

  const loadMetadata = useCallback(async () => {
    const data = await fetchJson<PodMetadata>("/api/pod-poap/metadata");
    setMetadata({
      name: data.name,
      symbol: data.symbol,
      totalSupply: data.totalSupply,
    });
  }, []);

  const loadTokens = useCallback(async () => {
    const current = await ensureAddress();
    const data = await fetchJson<{
      tokens: PodToken[];
      balance: number;
    }>(`/api/pod-poap/tokens/${current}`);
    setTokens(
      Array.isArray(data.tokens)
        ? data.tokens.map((token) => ({
            tokenId: Number(token.tokenId),
            tokenUri: token.tokenUri ?? null,
          }))
        : []
    );
    return data;
  }, [ensureAddress]);

  const claim = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const current = await ensureAddress();
      await fetchJson<{
        hash: string;
      }>("/api/pod-poap/mint", {
        method: "POST",
        body: JSON.stringify({ to: current }),
      });
      await loadTokens();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [ensureAddress, loadTokens]);

  useEffect(() => {
    loadMetadata().catch((err) => {
      const message = err instanceof Error ? err.message : String(err);
      setError((prev) => prev ?? message);
    });
  }, [loadMetadata]);

  const status = useMemo(
    () => ({
      loading,
      error,
      address,
      metadata,
      tokens,
    }),
    [address, error, loading, metadata, tokens]
  );

  return {
    ...status,
    refreshTokens: loadTokens,
    claim,
    resetError: () => setError(null),
  };
}
