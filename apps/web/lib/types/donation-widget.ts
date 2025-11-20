export interface DonationWidgetProps {
  dogName: string;
  raised?: number; // Legacy prop - will be replaced by fetched balances
  spent: number;
  fundsNeededFor: Array<{ icon: string; label: string }> | string[];
  campaignId?: string;
  careProviderAddress?: string;
  campaignStellarAddress?: string; // Campaign's stellar wallet address
  goal?: number;
}
