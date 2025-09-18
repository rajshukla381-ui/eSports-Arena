
import { UserProfile, Transaction, CoinRequest } from '@/lib/types';
import { getTransactions } from './data';
import { getCoinRequests } from './requests';

let usersData: UserProfile[] = [
    { email: 'rajshukla381@gmail.com', role: 'admin', isBlocked: false },
];

// Helper to ensure a user exists
const ensureUser = async (userId: string): Promise<UserProfile> => {
    let user = usersData.find(u => u.email === userId);
    if (!user) {
        user = { email: userId, role: 'guest', isBlocked: false };
        usersData.push(user);
    }
    return user;
};

// Simulate API calls
export const getUser = async (userId: string): Promise<UserProfile | undefined> => {
    await ensureUser(userId);
    return new Promise(resolve => setTimeout(() => resolve(usersData.find(u => u.email === userId)), 50));
};

export const createUser = async (userId: string, role: 'guest' | 'admin'): Promise<UserProfile> => {
    const existingUser = await getUser(userId);
    if (existingUser) {
      // If user exists, just update their role if trying to create an admin
      if (role === 'admin' && existingUser.role !== 'admin') {
        existingUser.role = 'admin';
      }
      return existingUser;
    }
    
    const newUser: UserProfile = { email: userId, role, isBlocked: false };
    usersData.push(newUser);
    return new Promise(resolve => setTimeout(() => resolve(newUser), 50));
}

export const getAllUsers = async (): Promise<UserProfile[]> => {
    // To discover all users, we can check transactions and requests
    const transactions = await getTransactions();
    const requests = await getCoinRequests();
    const userIdsFromTransactions = transactions.map(t => t.userId);
    const userIdsFromRequests = requests.map(r => r.userId);
    
    const allUserIds = [...new Set([...userIdsFromTransactions, ...userIdsFromRequests])];

    for (const userId of allUserIds) {
        await ensureUser(userId);
    }

    return new Promise(resolve => setTimeout(() => resolve([...usersData]), 50));
};

export const updateUserBlockedStatus = async (userId: string, isBlocked: boolean): Promise<UserProfile | undefined> => {
    const user = await ensureUser(userId);
    user.isBlocked = isBlocked;
    return new Promise(resolve => setTimeout(() => resolve(user), 50));
};

    
