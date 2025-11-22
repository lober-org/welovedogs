/**
 * Gets the POD POAP contract ID from environment variables or returns default
 */
export function getPodPoapContractId(): string {
  return (
    process.env.POD_POAP_CONTRACT_ID ||
    process.env.NEXT_PUBLIC_POD_POAP_CONTRACT_ID ||
    "CB6L7W2OTD5LPTC5TOLFPLHTQXAYSHIB4DWA5UNI6PYJ53PW6LYDK3AE" // Fallback to deployed contract
  );
}
