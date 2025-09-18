export type Tournament = {
  id: string;
  title: string;
  gameName: 'Free Fire' | 'BGMI' | 'Valorant';
  entryFee: number;
  prizePool: number;
  host: string;
  rules: string;
  matchTime: string;
  status: 'Upcoming' | 'Live' | 'Completed';
  imageUrl: string;
  imageHint: string;
};

export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  userId?: string; // Keep track of user for crediting wins
};

export type CoinRequest = {
  id: string;
  userId: string;
  date: string;
  type: 'credit' | 'debit';
  amount: number; // Final amount after deductions for debits (INR), or coin amount for credits
  originalAmount?: number; // Original coin amount before deductions for debits
  status: 'pending' | 'approved' | 'rejected';
  upiId?: string;
  screenshot?: string; // For simulation, we'll just store a name
  redeemCode?: string;
  redemptionType?: 'upi' | 'google_play';
  details?: string; // For storing '₹10 Google Play Code' etc.
};

    