

import { Tournament, Transaction, TournamentParticipant } from '@/lib/types';
import { placeholderImages } from '@/lib/placeholder-images.json';

const ffBanner = placeholderImages.find(p => p.id === 'game-ff');
const bgmiBanner = placeholderImages.find(p => p.id === 'game-bgmi');
const valorantBanner = placeholderImages.find(p => p.id === 'game-valorant');

let tournamentsData: Tournament[] = [
  {
    id: '1',
    title: 'Free Fire Ultimate Challenge',
    gameName: 'Free Fire',
    entryFee: 0,
    prizePool: 100000,
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
    entryFee: 0,
    prizePool: 500000,
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
    entryFee: 0,
    prizePool: 250000,
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
    entryFee: 0,
    prizePool: 200000,
    host: 'eSports Masters',
    rules: 'Sanhok & Vikendi maps. TPP mode. Double elimination. Points for kills and survival time.',
    matchTime: '2024-08-20T19:00:00Z',
    status: 'Upcoming',
    imageUrl: bgmiBanner?.imageUrl || '',
    imageHint: bgmiBanner?.imageHint || '',
  },
];

let transactionsData: Transaction[] = [
  { id: 't1', date: '2024-07-28', description: 'Initial Coin Balance', amount: 50000, type: 'credit', userId: 'player@example.com' },
  { id: 't2', date: '2024-07-27', description: 'Free Fire Weekly Entry Fee', amount: 500, type: 'debit', userId: 'player@example.com' },
  { id: 't3', date: '2024-07-26', description: 'Won BGMI Solo Challenge', amount: 15000, type: 'credit', userId: 'player@example.com' },
  { id: 't4', date: '2024-07-25', description: 'Redeemed for store credit', amount: 20000, type: 'debit', userId: 'player@example.com' },
];

let tournamentParticipantsData: TournamentParticipant[] = [];


// Simulate API calls
export const getTournaments = async (): Promise<Tournament[]> => {
  return new Promise(resolve => setTimeout(() => resolve([...tournamentsData]), 50));
};

export const getTournamentById = async (id: string): Promise<Tournament | undefined> => {
    return new Promise(resolve => setTimeout(() => resolve(tournamentsData.find(t => t.id === id)), 50));
}

export const addTournament = async (tournament: Omit<Tournament, 'id'>): Promise<Tournament> => {
    const newTournament = { ...tournament, id: `${Date.now()}` };
    tournamentsData.unshift(newTournament);
    return new Promise(resolve => setTimeout(() => resolve(newTournament), 50));
}

export const deleteTournament = async (tournamentId: string): Promise<void> => {
    tournamentsData = tournamentsData.filter(t => t.id !== tournamentId);
    return new Promise(resolve => setTimeout(() => resolve(), 50));
}

export const getTransactions = async (userId?: string): Promise<Transaction[]> => {
  return new Promise(resolve => setTimeout(() => {
    if (userId) {
        const userTransactions = transactionsData.filter(t => t.userId === userId);
        return resolve(userTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
    // If no userId, return all transactions
    return resolve(transactionsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, 50));
};

export const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
  const newTransaction = { ...transaction, id: `t-${Date.now()}` };
  transactionsData.unshift(newTransaction);
  return new Promise(resolve => setTimeout(() => resolve(newTransaction), 50));
};

export const getTournamentParticipants = async (tournamentId: string): Promise<TournamentParticipant[]> => {
    return new Promise(resolve => setTimeout(() => {
        resolve(tournamentParticipantsData.filter(p => p.tournamentId === tournamentId));
    }, 50));
}

export const isUserParticipant = async (tournamentId: string, userId: string): Promise<boolean> => {
    return new Promise(resolve => setTimeout(() => {
        resolve(tournamentParticipantsData.some(p => p.tournamentId === tournamentId && p.userId === userId));
    }, 50));
}

export const addTournamentParticipant = async (tournamentId: string, userId: string): Promise<TournamentParticipant> => {
    const newParticipant = { tournamentId, userId };
    // Avoid adding duplicates
    if (!await isUserParticipant(tournamentId, userId)) {
        tournamentParticipantsData.push(newParticipant);
    }
    return new Promise(resolve => setTimeout(() => resolve(newParticipant), 50));
}
    
export const setTournamentRoomDetails = async (tournamentId: string, roomDetails: { id: string, pass: string }): Promise<Tournament | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const tournamentIndex = tournamentsData.findIndex(t => t.id === tournamentId);
            if (tournamentIndex > -1) {
                tournamentsData[tournamentIndex].roomDetails = roomDetails;
                resolve(tournamentsData[tournamentIndex]);
            } else {
                resolve(undefined);
            }
        }, 50)
    });
}
