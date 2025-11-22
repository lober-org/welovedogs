export interface Rescuer {
  id: string;
  fullName: string;
  profilePhoto: string;
  country: string;
  city: string;
  email: string;
  socialMedia: {
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    youtube?: string;
    twitter?: string;
  };
  story: string;
  rating: number;
  totalReceived: number;
  totalSpent: number;
  dogsHelped: number;
  campaignsCompleted: number;
  updatesOnTime: number;
  totalUpdates: number;
  reputation: number;
  level: {
    name: string;
    icon: string;
    color: string;
    minReceived: number;
  };
  currentCauses: {
    dogId: string;
    dogName: string;
    dogImage: string;
    goal: number;
    raised: number;
  }[];
  transactions: {
    date: string;
    type: "donation" | "expense";
    amount: number;
    crypto?: string;
    donor?: string;
    txHash?: string;
    description?: string;
  }[];
  latestUpdates: {
    dogName: string;
    dogImage: string;
    update: string;
    date: string;
  }[];
}

export interface Transaction {
  date: string;
  type: "donation" | "expense";
  amount: number;
  crypto?: string;
  donor?: string;
  txHash?: string;
  description?: string;
}

export interface Update {
  dogName: string;
  dogImage: string;
  update: string;
  date: string;
}

export interface Cause {
  dogId: string;
  dogName: string;
  dogImage: string;
  goal: number;
  raised: number;
}
