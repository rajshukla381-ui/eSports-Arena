
import { Tournament, Transaction } from '@/lib/types';
import { placeholderImages } from '@/lib/placeholder-images.json';

const ffBanner = placeholderImages.find(p => p.id === 'game-ff');
const bgmiBanner = placeholderImages.find(p => p.id === 'game-bgmi');
const valorantBanner = placeholderImages.find(p => p.id === 'game-valorant');

let tournamentsData: Tournament[] = [
  {
    id: '1',
    title: 'Free Fire Ultimate Challenge',
    gameName: 'Free Fire',
    entryFee: 100,
    prizePool: 10000,
    host: 'Pro Gamers Inc.',
    rules: 'Classic squad mode. No emulators. All standard competitive rules apply. Points based on kills and placement.',
    matchTime: '2024-08-15T18:00:00Z',
    status: 'Upcoming',
    imageUrl: ffBanner?.imageUrl || '',
    imageHint: ffBanner?.imageHint || '',
  },
  {
    id: '2',
    title: 'BGMI Champions Series',
    gameName: 'BGMI',
    entryFee: 500,
    prizePool: 50000,
    host: 'eSports Masters',
    rules: 'Erangel map only. TPP mode. Standard point system. Fair play is mandatory.',
    matchTime: '2024-08-16T20:00:00Z',
    status: 'Upcoming',
    imageUrl: bgmiBanner?.imageUrl || '',
    imageHint: bgmiBanner?.imageHint || '',
  },
  {
    id: '3',
    title: 'Valorant Vanguard Tournament',
    gameName: 'Valorant',
    entryFee: 250,
    prizePool: 25000,
    host: 'CyberWarriors',
    rules: '5v5 standard competitive mode. All agents are allowed. Single elimination bracket.',
    matchTime: '2024-08-18T16:00:00Z',
    status: 'Upcoming',
    imageUrl: valorantBanner?.imageUrl || '',
    imageHint: valorantBanner?.imageHint || '',
  },
    {
    id: '4',
    title: 'BGMI Domination League',
    gameName: 'BGMI',
    entryFee: 200,
    prizePool: 20000,
    host: 'eSports Masters',
    rules: 'Sanhok & Vikendi maps. TPP mode. Double elimination. Points for kills and survival time.',
    matchTime: '2024-08-20T19:00:00Z',
    status: 'Upcoming',
    imageUrl: bgmiBanner?.imageUrl || '',
    imageHint: bgmiBanner?.imageHint || '',
  },
];

const transactionsData: Transaction[] = [
  { id: 't1', date: '2024-07-28', description: 'Wallet Deposit', amount: 5000, type: 'credit' },
  { id: 't2', date: '2024-07-27', description: 'Free Fire Weekly Entry Fee', amount: 50, type: 'debit' },
  { id: 't3', date: '2024-07-26', description: 'Won BGMI Solo Challenge', amount: 1500, type: 'credit' },
  { id: 't4', date: '2024-07-25', description: 'Withdrawal', amount: 2000, type: 'debit' },
  { id: 't5', date: '2024-07-24', description: 'Valorant Aces Entry Fee', amount: 100, type: 'debit' },
  { id: 't6', date: '2024-07-23', description: 'Wallet Deposit', amount: 1000, type: 'credit' },
];


// Simulate API calls
export const getTournaments = async (): Promise<Tournament[]> => {
  return new Promise(resolve => setTimeout(() => resolve([...tournamentsData]), 50));
};

export const addTournament = async (tournament: Omit<Tournament, 'id'>): Promise<Tournament> => {
    const newTournament = { ...tournament, id: `${Date.now()}` };
    tournamentsData.unshift(newTournament);
    return new Promise(resolve => setTimeout(() => resolve(newTournament), 50));
}

export const getTransactions = async (): Promise<Transaction[]> => {
  return new Promise(resolve => setTimeout(() => resolve(transactionsData), 50));
};
