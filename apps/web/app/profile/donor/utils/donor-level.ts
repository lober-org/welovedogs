export interface DonorLevel {
  name: string;
  min_total_donated: number;
  min_donations: number;
  icon: string;
  color: string;
  benefits: { perks: string[] };
}

interface Transaction {
  usd_value: number | null;
}

const DEFAULT_LEVEL: DonorLevel = {
  name: "Newcomer",
  min_total_donated: 0,
  min_donations: 0,
  icon: "🌱",
  color: "gray",
  benefits: { perks: [] },
};

/**
 * Calculates total donated amount from transactions
 */
export function calculateTotalDonated(transactions: Transaction[] | null): number {
  if (!transactions) return 0;
  return transactions.reduce((sum, tx) => sum + Number(tx.usd_value || 0), 0);
}

/**
 * Calculates donation count from transactions
 */
export function calculateDonationCount(transactions: Transaction[] | null): number {
  return transactions?.length || 0;
}

/**
 * Determines the current donor level based on total donations and donation count
 */
export function calculateDonorLevel(
  donorLevels: DonorLevel[] | null,
  totalDonatedAmount: number,
  donationCount: number
): DonorLevel {
  if (!donorLevels || donorLevels.length === 0) {
    return DEFAULT_LEVEL;
  }

  // Reverse to check from highest to lowest level
  const reversedLevels = [...donorLevels].reverse();

  const matchingLevel = reversedLevels.find(
    (level) => totalDonatedAmount >= level.min_total_donated && donationCount >= level.min_donations
  );

  return matchingLevel || donorLevels[0] || DEFAULT_LEVEL;
}
