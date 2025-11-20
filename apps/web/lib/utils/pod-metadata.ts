import { headers } from "next/headers";
import { notFound } from "next/navigation";

export type PodAttribute = {
  trait_type: string;
  value: string;
};

export type PodMetadata = {
  name: string;
  description: string;
  image: string;
  attributes?: PodAttribute[];
  external_url?: string;
};

/**
 * Resolves the base URL for the application.
 * First checks NEXT_PUBLIC_APP_URL environment variable,
 * then falls back to extracting from request headers.
 */
export async function resolveBaseUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const headerList = await headers();
  const host = headerList.get("host");
  if (!host) {
    throw new Error("Unable to determine host for metadata request.");
  }
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

/**
 * Fetches POD metadata for a given token ID.
 * @param tokenId - The token ID to fetch metadata for
 * @returns Promise resolving to PodMetadata
 * @throws Error if the request fails or token is not found
 */
export async function getPodMetadata(tokenId: string): Promise<PodMetadata> {
  const baseUrl = await resolveBaseUrl();
  const response = await fetch(`${baseUrl}/api/pod-poap/metadata/${tokenId}`, {
    next: {
      revalidate: 300,
    },
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error(
      `Failed to load metadata for token #${tokenId}: ${response.status} ${response.statusText}`
    );
  }

  return (await response.json()) as PodMetadata;
}
