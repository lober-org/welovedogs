/**
 * POD-specific configuration utilities.
 * Centralizes access to POD POAP contract and donation-related environment variables.
 */

export type PodConfig = {
  contractId: string | null;
  explorerBaseUrl: string | undefined;
  network: string;
  defaultRecipient: string | undefined;
};

/**
 * Gets POD-specific configuration from environment variables.
 * @returns PodConfig object with contract ID, explorer URL, network, and default recipient
 */
export function getPodConfig(): PodConfig {
  return {
    contractId: process.env.NEXT_PUBLIC_POD_POAP_CONTRACT_ID ?? null,
    explorerBaseUrl: process.env.NEXT_PUBLIC_STELLAR_EXPLORER_URL ?? undefined,
    network: process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet",
    defaultRecipient: process.env.NEXT_PUBLIC_DEFAULT_DONATION_RECIPIENT,
  };
}
