

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
  userId: string;
};

export type CoinRequest = {
  id: string;
  userId: string;
  date: string;
  type: 'credit' | 'tournament_creation';
  amount: number;
  originalAmount?: number; 
  status: 'pending' | 'approved' | 'rejected';
  screenshot?: string; 
  redeemCode?: string;
  tournamentDetails?: Omit<Tournament, 'id' | 'status' | 'imageUrl' | 'imageHint'>;
  details?: {
    upiId?: string;
    finalAmount?: number;
    gst?: number;
    platformFee?: number;
    redeemOption?: 'upi' | 'google_play';
    googlePlayPackage?: {
        name: string;
        coins: number;
    },
    sentRedeemCode?: string;
  }
};

export type Notification = {
    id: string;
    userId: string;
    date: string;
    message: string;
    isRead: boolean;
    link?: string;
};
