import { getConfig } from "@/lib/config";

/**
 * Get the Stellar Expert explorer network path based on the configured network
 * @returns "public" for mainnet, "testnet" for testnet
 */
export function getExplorerNetwork(): "public" | "testnet" {
  const cfg = getConfig();
  return cfg.stellarNetwork === "public" || cfg.stellarNetwork === "mainnet" ? "public" : "testnet";
}

/**
 * Build a Stellar Expert explorer URL for a transaction
 * @param txHash - The transaction hash
 * @returns Full URL to the transaction on Stellar Expert
 */
export function getTransactionExplorerUrl(txHash: string): string {
  const network = getExplorerNetwork();
  return `https://stellar.expert/explorer/${network}/tx/${txHash}`;
}

/**
 * Build a Stellar Expert explorer URL for an account
 * @param address - The Stellar account address
 * @returns Full URL to the account on Stellar Expert
 */
export function getAccountExplorerUrl(address: string): string {
  const network = getExplorerNetwork();
  return `https://stellar.expert/explorer/${network}/account/${address}`;
}

/**
 * Build a Stellar Expert explorer URL for a contract
 * @param contractId - The contract ID
 * @returns Full URL to the contract on Stellar Expert
 */
export function getContractExplorerUrl(contractId: string): string {
  const network = getExplorerNetwork();
  return `https://stellar.expert/explorer/${network}/contract/${contractId}`;
}
