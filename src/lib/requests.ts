
import { CoinRequest } from '@/lib/types';
import { addNotification } from './notifications';

let coinRequestsData: CoinRequest[] = [];

// Simulate API calls
export const getCoinRequests = async (): Promise<CoinRequest[]> => {
  return new Promise(resolve => setTimeout(() => resolve([...coinRequestsData]), 50));
};

export const addCoinRequest = async (request: Omit<CoinRequest, 'id' | 'date' | 'status'>): Promise<CoinRequest> => {
    const newRequest: CoinRequest = {
        ...request,
        id: `req-${Date.now()}`,
        date: new Date().toISOString(),
        status: 'pending'
    };
    coinRequestsData.unshift(newRequest);
    return new Promise(resolve => setTimeout(() => resolve(newRequest), 50));
}

export const updateCoinRequestStatus = async (id: string, status: 'approved' | 'rejected'): Promise<CoinRequest | undefined> => {
    return new Promise(resolve => {
        setTimeout(async () => {
            const requestIndex = coinRequestsData.findIndex(r => r.id === id);
            if (requestIndex > -1) {
                const request = coinRequestsData[requestIndex];
                request.status = status;

                let message = '';
                if (status === 'approved') {
                    message = `Your request for ${request.originalAmount || request.amount} coins has been approved.`;
                } else {
                    message = `Your request for ${request.originalAmount || request.amount} coins has been rejected.`;
                }

                await addNotification({
                    userId: request.userId,
                    message: message
                });

                resolve(request);
            } else {
                resolve(undefined);
            }
        }, 50)
    });
}
