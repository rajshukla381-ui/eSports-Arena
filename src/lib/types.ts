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
};
