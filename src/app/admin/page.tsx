
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CoinRequest, Transaction } from '@/lib/types';
import { getCoinRequests, updateCoinRequestStatus } from '@/lib/requests';
import { addTransaction, getTransactions } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight, Check, XIcon, Copy, Gift, CircleDollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';


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
        const originalRequestAmount = request.originalAmount || request.amount;

        await updateCoinRequestStatus(request.id, newStatus);

        if (newStatus === 'approved') {
            const description = request.redeemCode 
                ? `Redeem Code: ${request.redeemCode}`
                : request.type === 'credit'
                ? 'Coins from Admin'
                : 'Redeemed to Admin';
            
            // For debits (withdrawals), the transaction amount debited from the user's wallet
            // should be the original requested amount before fees.
            const transactionAmount = request.type === 'debit' ? originalRequestAmount : request.amount;

            await addTransaction({
                userId: request.userId,
                date: new Date().toISOString(),
                description,
                amount: transactionAmount,
                type: request.type,
            });

            toast({
                title: 'Request Approved',
                description: `A transaction for ${transactionAmount.toLocaleString()} coins has been created for ${request.userId}.`
            });
        } else {
             toast({
                title: 'Request Rejected',
                description: `The coin request from ${request.userId} has been rejected.`
            });
        }
        
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
                    <CardTitle>Coin Requests</CardTitle>
                    <CardDescription>Approve or reject coin credit and redemption requests from users.</CardDescription>
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
                                    <Badge variant={request.type === 'credit' ? 'secondary' : 'destructive'}>
                                        {request.redeemCode ? <Gift className="w-4 h-4 mr-1"/> : request.type === 'credit' ? <ArrowUpRight className="w-4 h-4 mr-1"/> : <ArrowDownLeft className="w-4 h-4 mr-1"/>}
                                        {request.redeemCode ? 'Redeem' : request.type}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                     <div className="flex flex-col">
                                        <span className="font-bold flex items-center gap-1">
                                            {request.type === 'debit' ? `₹${request.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : (
                                                <><CircleDollarSign className="w-4 h-4" />{request.amount.toLocaleString()}</>
                                            )}
                                        </span>
                                        {request.originalAmount && (
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                (from <CircleDollarSign className="w-3 h-3"/>{request.originalAmount.toLocaleString()})
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs">
                                    {request.type === 'debit' && `UPI: ${request.upiId}`}
                                    {request.type === 'credit' && request.screenshot && `Screenshot: ${request.screenshot}`}
                                    {request.redeemCode && (
                                        <div className="flex items-center gap-2">
                                            <span>Code: <span className="font-mono">{request.redeemCode}</span></span>
                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(request.redeemCode!, 'Redeem code')}>
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>{format(new Date(request.date), 'PPp')}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button size="icon" variant="ghost" className="text-green-500" onClick={() => handleRequest(request, 'approved')}>
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

            <Card>
                <CardHeader>
                    <CardTitle>Tournament Creation</CardTitle>
                    <CardDescription>How users create tournaments.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>
                        Users can now create their own tournaments directly from their profile page.
                    </p>
                    <p>
                        When a user creates a tournament, they are required to pay the full prize pool amount plus a 20% service fee to the main administrator's UPI address.
                    </p>
                    <p>
                        Once the payment is confirmed by the admin, the tournament will become visible to all users.
                    </p>
                     <Link href="/profile" passHref>
                        <Button>Go to Profile to Create</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
