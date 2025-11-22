export interface Dog {
  name: string;
  location: string;
  images: string[];
  categoryTags: string[];
  currentCondition: string;
  headline?: string;
  fundsNeededFor: Array<{ icon: string; label: string }>;
  story: string;
  confirmation: string;
  careProvider?: CareProvider;
  updates?: Update[];
  transactions?: Transaction[];
  expenses?: Expense[];
  raised: number;
  goal: number;
  spent?: number;
  campaignId?: string;
  campaignStellarAddress?: string;
}

export interface CareProvider {
  id: number;
  name: string;
  type: string;
  location: string;
  image: string;
  rating?: number;
  description?: string;
  about?: string;
  email?: string;
  phone?: string;
  website?: string;
}

export interface Update {
  id?: string;
  title: string;
  date: string;
  description: string;
  image: string;
}

export interface Transaction {
  date: string;
  cryptoAmount: string;
  tokenSymbol: string;
  usdValue: number;
  donor: string;
  txHash: string;
  explorerUrl: string;
  type?: "escrow" | "instant";
}

export interface Expense {
  id: string;
  title: string;
  description: string;
  amount: number;
  date: string;
  proof?: string;
}

export interface Comment {
  author: string;
  message: string;
  date: string;
  badges?: number;
}
