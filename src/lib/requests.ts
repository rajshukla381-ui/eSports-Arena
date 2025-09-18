
import { CoinRequest } from '@/lib/types';
import { addNotification } from './notifications';
import { addTransaction } from './data';

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
    
    // If it's a withdrawal or tournament creation, create a pending debit transaction
    if (newRequest.type === 'debit' || newRequest.type === 'tournament_creation') {
        const description = newRequest.type === 'debit'
            ? 'Withdrawal Request (Pending)'
            : `Tournament Fee: ${newRequest.tournamentDetails?.title} (Pending)`;

        await addTransaction({
            userId: newRequest.userId,
            date: new Date().toISOString(),
            description: description,
            amount: newRequest.amount,
            type: 'debit'
        });
    }

    return new Promise(resolve => setTimeout(() => resolve(newRequest), 50));
}

export const updateCoinRequestStatus = async (id: string, status: 'approved' | 'rejected', sentRedeemCode?: string): Promise<CoinRequest | undefined> => {
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
                        // The debit transaction was already created as pending, now it's final.
                        // We could update its description here if needed, but for now we'll leave it.
                    } else if (request.type === 'credit') {
                        message = `Your request for ${request.amount.toLocaleString()} coins has been approved.`;
                    } else if (request.type === 'debit') {
                         if (request.details?.redeemOption === 'google_play' && sentRedeemCode) {
                            request.details.sentRedeemCode = sentRedeemCode;
                            message = `Your withdrawal request for a ${request.details.googlePlayPackage?.name} has been approved! Your code is: ${sentRedeemCode}`;
                         } else {
                            message = `Your withdrawal request for ${request.amount.toLocaleString()} coins has been approved and processed.`;
                         }
                    }
                } else { // Rejected
                     const refundDescription = request.type === 'tournament_creation'
                        ? `Tournament Fee Refund: ${request.tournamentDetails?.title}`
                        : `Withdrawal Request Rejected (Refund)`;

                     if (request.type === 'tournament_creation') {
                        message = `Your tournament "${request.tournamentDetails?.title}" has been rejected.`;
                        await addTransaction({
                            userId: request.userId,
                            date: new Date().toISOString(),
                            description: refundDescription,
                            amount: request.amount,
                            type: 'credit'
                        });
                    } else if (request.type === 'credit') {
                        message = `Your request for ${request.amount.toLocaleString()} coins has been rejected.`;
                    } else if (request.type === 'debit') {
                        message = `Your withdrawal request for ${request.amount.toLocaleString()} coins has been rejected.`;
                        // Refund the points
                        await addTransaction({
                            userId: request.userId,
                            date: new Date().toISOString(),
                            description: refundDescription,
                            amount: request.amount,
                            type: 'credit'
                        });
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

    