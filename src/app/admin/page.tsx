
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CoinRequest, Tournament } from '@/lib/types';
import { getCoinRequests, updateCoinRequestStatus } from '@/lib/requests';
import { addTransaction, addTournament } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ArrowUpRight, Check, XIcon, Copy, Gift, CircleDollarSign, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { placeholderImages } from '@/lib/placeholder-images.json';


export default function AdminPage() {
    const [requests, setRequests] = useState<CoinRequest[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        const fetchRequests = async () => {
            const pendingRequests = await getCoinRequests();
            setRequests(pendingRequests.filter(r => r.status === 'pending'));
        };
        fetchRequests();
    }, []);

    const handleRequest = async (request: CoinRequest, newStatus: 'approved' | 'rejected') => {
        
        if (newStatus === 'approved') {
            let description = '';
            let transactionAmount = 0;
            let transactionType: 'credit' | 'tournament_creation' = request.type;

            if (request.type === 'tournament_creation') {
                 const ffBanner = placeholderImages.find(p => p.id === 'game-ff');
                const bgmiBanner = placeholderImages.find(p => p.id === 'game-bgmi');
                const valorantBanner = placeholderImages.find(p => p.id === 'game-valorant');
                let imageUrl = '';
                let imageHint = '';

                switch (request.tournamentDetails!.gameName) {
                    case 'Free Fire':
                        imageUrl = ffBanner?.imageUrl || '';
                        imageHint = ffBanner?.imageHint || '';
                        break;
                    case 'BGMI':
                        imageUrl = bgmiBanner?.imageUrl || '';
                        imageHint = bgmiBanner?.imageHint || '';
                        break;
                    case 'Valorant':
                        imageUrl = valorantBanner?.imageUrl || '';
                        imageHint = valorantBanner?.imageHint || '';
                        break;
                }

                const newTournament: Omit<Tournament, 'id'> = {
                    ...request.tournamentDetails!,
                    status: 'Upcoming',
                    imageUrl,
                    imageHint
                };
                await addTournament(newTournament);
                
                await addTransaction({
                    userId: request.userId,
                    date: new Date().toISOString(),
                    description: `Creation fee for ${request.tournamentDetails!.title}`,
                    amount: request.amount,
                    type: 'debit',
                });
                
                toast({
                    title: 'Tournament Approved',
                    description: `${request.tournamentDetails!.title} is now live and ${request.amount.toLocaleString()} coins have been debited from ${request.userId}.`
                });

            } else {
                 description = request.redeemCode 
                    ? `Redeem Code: ${request.redeemCode}`
                    : 'Coins from Admin';
                
                transactionAmount = request.amount;

                await addTransaction({
                    userId: request.userId,
                    date: new Date().toISOString(),
                    description,
                    amount: transactionAmount,
                    type: 'credit',
                });

                 toast({
                    title: 'Request Approved',
                    description: `A transaction for ${transactionAmount.toLocaleString()} coins has been created for ${request.userId}.`
                });
            }
        } else {
             toast({
                title: 'Request Rejected',
                description: `The coin request from ${request.userId} has been rejected.`
            });
        }
        
        await updateCoinRequestStatus(request.id, newStatus);
        
        setRequests(requests.filter(r => r.id !== request.id));
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied!', description: `${label} copied to clipboard.` });
    }


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
        <div className="w-full max-w-6xl space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-glow-primary">Admin Panel</h1>
                <p className="text-muted-foreground">Manage your eSports Arena</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                    <CardDescription>Approve or reject coin and tournament creation requests from users.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {requests.length > 0 ? requests.map(request => (
                            <TableRow key={request.id}>
                                <TableCell>{request.userId}</TableCell>
                                <TableCell>
                                    <Badge variant={request.type === 'credit' ? 'secondary' : 'default'}>
                                        {request.type === 'credit' && request.redeemCode ? <Gift className="w-4 h-4 mr-1"/> : request.type === 'credit' ? <ArrowUpRight className="w-4 h-4 mr-1"/> : <Trophy className="w-4 h-4 mr-1" />}
                                        {request.redeemCode ? 'Redeem' : request.type.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                     <div className="flex flex-col">
                                        <span className="font-bold flex items-center gap-1">
                                            <CircleDollarSign className="w-4 h-4" />{request.amount.toLocaleString()}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs max-w-[200px] truncate">
                                    {request.type === 'credit' && request.screenshot && `Screenshot: ${request.screenshot}`}
                                    {request.redeemCode && (
                                        <div className="flex items-center gap-2">
                                            <span>Code: <span className="font-mono">{request.redeemCode}</span></span>
                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(request.redeemCode!, 'Redeem code')}>
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    )}
                                    {request.type === 'tournament_creation' && request.tournamentDetails && (
                                        <span>{request.tournamentDetails.title}</span>
                                    )}
                                </TableCell>
                                <TableCell>{format(new Date(request.date), 'PPp')}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="text-green-500" 
                                        onClick={() => handleRequest(request, 'approved')}>
                                        <Check className="w-5 h-5" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleRequest(request, 'rejected')}>
                                        <XIcon className="w-5 h-5" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    No pending requests.
                                </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
      </main>
    </div>
  );
}
