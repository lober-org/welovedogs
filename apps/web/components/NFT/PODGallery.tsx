"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PodToken } from "@/hooks/usePodPoap";
import type { TokenMetadata } from "./types";

type PodGalleryProps = {
  isConnected: boolean;
  tokens: PodToken[];
  loading?: boolean;
  refreshing?: boolean;
  contractId?: string | null;
  network?: string;
  explorerBaseUrl?: string;
};

function resolveExplorerBase(network?: string, override?: string) {
  if (override) {
    return override.replace(/\/$/, "");
  }

  const normalized = (network ?? "testnet").toLowerCase();
  return normalized === "public"
    ? "https://stellar.expert/explorer/public"
    : "https://stellar.expert/explorer/testnet";
}

function buildExplorerUrl({
  contractId,
  network,
  explorerBaseUrl,
  tokenId,
}: {
  contractId?: string | null;
  network?: string;
  explorerBaseUrl?: string;
  tokenId: number;
}) {
  if (!contractId) {
    return null;
  }

  const base = resolveExplorerBase(network, explorerBaseUrl);
  return `${base}/contract/${contractId}#token-${tokenId}`;
}

export function PODGallery({
  isConnected,
  tokens,
  loading = false,
  refreshing = false,
  contractId,
  network,
  explorerBaseUrl,
}: PodGalleryProps) {
  const hasTokens = useMemo(() => tokens.length > 0, [tokens]);
  const [tokenMetadata, setTokenMetadata] = useState<Record<number, TokenMetadata | null>>({});
  const [tokenMetadataLoading, setTokenMetadataLoading] = useState(false);

  useEffect(() => {
    if (!hasTokens) {
      setTokenMetadata({});
      setTokenMetadataLoading(false);
      return;
    }

    let cancelled = false;

    async function loadTokenMetadata() {
      setTokenMetadataLoading(true);
      try {
        const entries = await Promise.all(
          tokens.map(async (token) => {
            if (!token.tokenUri) {
              return [token.tokenId, null] as const;
            }

            try {
              const response = await fetch(token.tokenUri);
              if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
              }
              const data = (await response.json()) as TokenMetadata;
              return [token.tokenId, data] as const;
            } catch (error) {
              console.error(
                `[pod][gallery] failed to load metadata for token #${token.tokenId}:`,
                error instanceof Error ? error.message : error
              );
              return [token.tokenId, null] as const;
            }
          })
        );

        if (!cancelled) {
          setTokenMetadata(Object.fromEntries(entries));
        }
      } finally {
        if (!cancelled) {
          setTokenMetadataLoading(false);
        }
      }
    }

    loadTokenMetadata();

    return () => {
      cancelled = true;
    };
  }, [hasTokens, tokens]);

  if (!isConnected) {
    return (
      <p className="text-sm text-gray-600">Conecta una wallet para revisar tus PODs reclamados.</p>
    );
  }

  if (refreshing || loading) {
    return <p className="text-sm text-gray-600">Cargando tus PODs…</p>;
  }

  if (!hasTokens) {
    return (
      <p className="text-sm text-gray-600">
        Aún no tienes PODs. Reclama el primero para celebrar tu donación.
      </p>
    );
  }

  if (tokenMetadataLoading) {
    return <p className="text-sm text-gray-600">Cargando detalles visuales de tus PODs…</p>;
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {tokens.map((token) => (
        <li key={token.tokenId} className="h-full">
          <TokenCard
            tokenId={token.tokenId}
            metadata={tokenMetadata[token.tokenId] ?? null}
            metadataUrl={token.tokenUri}
            explorerUrl={buildExplorerUrl({
              contractId,
              network,
              explorerBaseUrl,
              tokenId: token.tokenId,
            })}
          />
        </li>
      ))}
    </ul>
  );
}

type TokenCardProps = {
  tokenId: number;
  metadata: TokenMetadata | null;
  metadataUrl: string | null;
  explorerUrl?: string | null;
};

function TokenCard({ tokenId, metadata, metadataUrl, explorerUrl }: TokenCardProps) {
  const imageSrc = metadata?.image ?? null;
  const name = metadata?.name ?? `POD #${tokenId}`;
  const description = metadata?.description ?? "Certificado de una donación para rescate canino.";
  const attributes = metadata?.attributes ?? [];
  const collection = attributes.find((attr) => attr.trait_type === "Collection")?.value;
  const series = attributes.find((attr) => attr.trait_type === "Series")?.value;
  const edition = attributes.find((attr) => attr.trait_type === "Edition")?.value;

  return (
    <article className="group relative flex h-full flex-col rounded-[28px] bg-linear-to-br from-indigo-200/40 via-violet-200/30 to-sky-200/35 p-1.5 shadow-[0_18px_35px_-20px_rgba(79,70,229,0.55)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_45px_-15px_rgba(129,140,248,0.6)]">
      <div className="flex h-full flex-col rounded-[22px] bg-white/95 p-6">
        <header className="relative mb-6">
          <div className="absolute inset-0 translate-y-2 rounded-[22px] bg-linear-to-br from-indigo-100/50 via-fuchsia-100/40 to-sky-100/40 blur-3xl transition duration-300 group-hover:scale-110" />
          <div className="relative flex flex-col items-center gap-4 rounded-[22px] border border-white/60 bg-white/80 px-6 pb-6 pt-8 shadow-inner ring-1 ring-indigo-100/60">
            <span className="absolute left-5 top-5 inline-flex items-center rounded-full bg-indigo-50/80 px-3 py-1 text-xs font-semibold text-indigo-600 ring-1 ring-indigo-200/70">
              POD #{tokenId}
            </span>
            {series ? (
              <span className="absolute right-5 top-5 inline-flex items-center rounded-full bg-fuchsia-50/80 px-3 py-1 text-xs font-semibold text-fuchsia-600 ring-1 ring-fuchsia-200/70">
                Serie {series}
              </span>
            ) : null}
            <div className="flex h-44 w-44 items-center justify-center rounded-full border-[6px] border-white bg-linear-to-br from-white via-indigo-50 to-white shadow-[0_12px_25px_-12px_rgba(67,56,202,0.4)] ring-1 ring-indigo-100/70">
              {imageSrc ? (
                <Link
                  // @ts-ignore - dynamic route string handled at runtime
                  href={`/pod/${tokenId}`}
                  className="block h-[160px] w-[160px] overflow-hidden rounded-full"
                >
                  <Image
                    src={imageSrc}
                    alt={name}
                    width={320}
                    height={320}
                    unoptimized
                    className="h-full w-full rounded-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                </Link>
              ) : (
                <span className="text-xs text-gray-500">Imagen no disponible</span>
              )}
            </div>
            {edition ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600/10 px-3 py-1 text-xs font-semibold text-indigo-600 ring-1 ring-indigo-100/80">
                {edition}
              </span>
            ) : null}
          </div>
        </header>

        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
          <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">{description}</p>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-2 text-xs font-medium text-gray-500">
          {collection ? (
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <dt className="flex items-center gap-2 uppercase tracking-wide text-gray-500">
                <span className="h-2 w-2 rounded-full bg-indigo-400" />
                Colección
              </dt>
              <dd className="text-gray-700">{collection}</dd>
            </div>
          ) : null}
          {attributes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {attributes
                .filter((attr) => !["Collection", "Series", "Edition"].includes(attr.trait_type))
                .map((attr) => (
                  <span
                    key={`${attr.trait_type}-${attr.value}`}
                    className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-600"
                  >
                    {attr.trait_type}: {attr.value}
                  </span>
                ))}
            </div>
          ) : null}
        </dl>

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
          <Link
            // @ts-ignore - dynamic route string handled at runtime
            href={`/pod/${tokenId}`}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_22px_-12px_rgba(79,70,229,0.8)] transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Ver POD ↗
          </Link>
          {metadataUrl ? (
            <a
              href={metadataUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-indigo-200 px-4 py-2 text-sm font-medium text-indigo-600 transition hover:border-indigo-300 hover:text-indigo-700"
            >
              Metadata
            </a>
          ) : (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-2 text-xs font-medium text-gray-500">
              Metadata no disponible
            </span>
          )}
          {explorerUrl ? (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-indigo-200 px-4 py-2 text-sm font-medium text-indigo-600 transition hover:border-indigo-300 hover:text-indigo-700"
            >
              Ver en Stellar Explorer
            </a>
          ) : null}
          {metadata?.external_url ? (
            <a
              href={metadata.external_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:text-gray-700"
            >
              Sitio de la campaña
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
