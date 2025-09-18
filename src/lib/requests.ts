
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

export const updateCoinRequestStatus = async (id: string, status: 'approved' | 'rejected', redeemCode?: string): Promise<CoinRequest | undefined> => {
    return new Promise(resolve => {
        setTimeout(async () => {
            const requestIndex = coinRequestsData.findIndex(r => r.id === id);
            if (requestIndex > -1) {
                const request = coinRequestsData[requestIndex];
                request.status = status;

                let message = '';
                if (status === 'approved') {
                    if (request.type === 'tournament_creation') {
                        message = `Your tournament "${request.tournamentDetails?.title}" has been approved and is now live!`;
                    } else if (request.type === 'debit') {
                        if (request.redemptionType === 'google_play') {
                             if(redeemCode) {
                                request.details = redeemCode; // Store sent code
                                message = `Your request for a ${request.details} has been approved. Your code is: ${redeemCode}`;
                             } else {
                                message = `Your request for ${request.details} has been approved.`;
                             }
                        } else {
                            message = `Your redemption request for ${request.originalAmount?.toLocaleString()} coins has been approved.`;
                        }
                    } else {
                        message = `Your request for ${request.amount.toLocaleString()} coins has been approved.`;
                    }
                } else {
                     if (request.type === 'tournament_creation') {
                        message = `Your tournament "${request.tournamentDetails?.title}" has been rejected.`;
                    } else if (request.type === 'debit') {
                        message = `Your redemption request for ${request.originalAmount?.toLocaleString()} coins has been rejected.`;
                    } else {
                        message = `Your request for ${request.amount.toLocaleString()} coins has been rejected.`;
                    }
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

    