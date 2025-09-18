
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CoinRequest, Tournament, Transaction, UserProfile } from '@/lib/types';
import { getCoinRequests, updateCoinRequestStatus } from '@/lib/requests';
import { addTransaction, addTournament, getTransactions, getTournaments, deleteTournament as deleteTournamentFromData } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ArrowUpRight, Check, XIcon, Copy, Gift, CircleDollarSign, Trophy, ArrowDownLeft, Ban, Trash2, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAllUsers, updateUserBlockedStatus } from '@/lib/users';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { addNotification } from '@/lib/notifications';


export default function AdminPage() {
    const [requests, setRequests] = useState<CoinRequest[]>([]);
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [allTournaments, setAllTournaments] = useState<Tournament[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [sendAmount, setSendAmount] = useState('');
    const { toast } = useToast();

    const fetchData = async () => {
        const pendingRequests = await getCoinRequests();
        setRequests(pendingRequests.filter(r => r.status === 'pending'));
        
        const transactions = await getTransactions();
        setAllTransactions(transactions);

        const tournaments = await getTournaments();
        setAllTournaments(tournaments);

        const userProfiles = await getAllUsers();
        setUsers(userProfiles);
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000); // Refresh data every 3 seconds
        return () => clearInterval(interval);
    }, []);

    const handleRequest = async (request: CoinRequest, newStatus: 'approved' | 'rejected', sentRedeemCode?: string) => {
        
        if (newStatus === 'approved') {
            if (request.type === 'tournament_creation') {
                const newTournament: Omit<Tournament, 'id'> = {
                    ...request.tournamentDetails!,
                    creatorId: request.userId,
                    status: 'Upcoming',
                    imageHint: 'custom tournament banner'
                };
                await addTournament(newTournament);
                
                toast({
                    title: 'Tournament Approved',
                    description: `${request.tournamentDetails!.title} is now live.`
                });

            } else if (request.type === 'credit') {
                 const description = request.redeemCode 
                    ? `Redeemed Code: ${request.redeemCode}`
                    : 'Points from Admin';
                
                const transactionAmount = request.amount;

                await addTransaction({
                    userId: request.userId,
                    date: new Date().toISOString(),
                    description,
                    amount: transactionAmount,
                    type: 'credit',
                });

                 toast({
                    title: 'Request Approved',
                    description: `A transaction for ${transactionAmount.toLocaleString()} points has been created for ${request.userId}.`
                });
            } else if (request.type === 'debit') {
                 toast({
                    title: 'Withdrawal Approved',
                    description: `The withdrawal request from ${request.userId} has been approved.`
                });
            }
        } else { // Rejected
             toast({
                title: 'Request Rejected',
                description: `The request from ${request.userId} has been rejected.`
            });
        }
        
        await updateCoinRequestStatus(request.id, newStatus, sentRedeemCode);
        
        fetchData();
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied!', description: `${label} copied to clipboard.` });
    }

    const handleToggleBlockUser = async (userId: string, isBlocked: boolean) => {
        await updateUserBlockedStatus(userId, !isBlocked);
        toast({
            title: `User ${!isBlocked ? 'Blocked' : 'Unblocked'}`,
            description: `User ${userId} has been ${!isBlocked ? 'blocked' : 'unblocked'}.`
        });
        fetchData();
    }
    
    const deleteTournament = async (tournamentId: string) => {
        await deleteTournamentFromData(tournamentId);
        toast({
            title: 'Tournament Deleted',
            description: 'The tournament has been removed.'
        });
        fetchData();
    }

    const handleSendCoins = async () => {
        const amountNum = parseInt(sendAmount);
        if (!recipientEmail || !/^\S+@\S+\.\S+$/.test(recipientEmail)) {
            toast({ variant: 'destructive', title: 'Invalid Email', description: 'Please enter a valid recipient email.' });
            return;
        }
        if (isNaN(amountNum) || amountNum <= 0) {
            toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid amount.' });
            return;
        }

        await addTransaction({
            userId: recipientEmail,
            date: new Date().toISOString(),
            description: 'Points from Admin',
            amount: amountNum,
            type: 'credit',
        });

        await addNotification({
            userId: recipientEmail,
            message: `You have received ${amountNum.toLocaleString()} points from an admin.`
        });
        
        toast({
            title: 'Coins Sent!',
            description: `Successfully sent ${amountNum.toLocaleString()} points to ${recipientEmail}.`,
        });

        setRecipientEmail('');
        setSendAmount('');
        fetchData();
    }


    const renderTypeBadge = (request: CoinRequest) => {
        switch(request.type) {
            case 'credit':
                return (
                    <Badge variant="secondary">
                        {request.redeemCode ? <Gift className="w-4 h-4 mr-1"/> : <ArrowUpRight className="w-4 h-4 mr-1" />}
                        {request.redeemCode ? 'Redeem' : 'Credit'}
                    </Badge>
                );
            case 'debit':
                 return (
                    <Badge variant="destructive">
                        <ArrowDownLeft className="w-4 h-4 mr-1"/>
                        Withdraw
                    </Badge>
                );
            case 'tournament_creation':
                return (
                    <Badge variant="default">
                        <Trophy className="w-4 h-4 mr-1" />
                        Tournament
                    </Badge>
                );
        }
    }


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
        <div className="w-full max-w-7xl space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-glow-primary">Admin Panel</h1>
                <p className="text-muted-foreground">Manage your eSports Arena</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Send Coins</CardTitle>
                        <CardDescription>Directly credit points to any user's wallet.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="recipientEmail">Recipient Email</Label>
                            <Input id="recipientEmail" type="email" placeholder="user@example.com" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="sendAmount">Amount</Label>
                            <Input id="sendAmount" type="number" placeholder="e.g., 5000" value={sendAmount} onChange={e => setSendAmount(e.target.value)} />
                        </div>
                        <Button className="w-full" onClick={handleSendCoins}>
                            <Send className="w-4 h-4 mr-2" />
                            Send Coins
                        </Button>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>Block or unblock users from accessing the app.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <ScrollArea className="h-[238px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User ID</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.filter(u => u.role !== 'admin').map(user => (
                                        <TableRow key={user.email}>
                                            <TableCell className="truncate max-w-[150px]">{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.isBlocked ? 'destructive' : 'secondary'}>
                                                    {user.isBlocked ? 'Blocked' : 'Active'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleBlockUser(user.email, user.isBlocked)}
                                                >
                                                    <Ban className="w-4 h-4 mr-2" />
                                                    {user.isBlocked ? 'Unblock' : 'Block'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Pending Requests</CardTitle>
                        <CardDescription>Approve or reject point and tournament creation requests from users.</CardDescription>
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
                                    <TableCell className="max-w-[150px] truncate">{request.userId}</TableCell>
                                    <TableCell>
                                        {renderTypeBadge(request)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold flex items-center gap-1">
                                                <CircleDollarSign className="w-4 h-4" />{request.amount.toLocaleString()}
                                            </span>
                                            {request.type === 'tournament_creation' && request.tournamentDetails && (
                                                <span className="text-xs text-muted-foreground">Prize: {request.tournamentDetails.prizePool.toLocaleString()}</span>
                                            )}
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
                                        {request.type === 'debit' && request.details?.redeemOption === 'upi' && `UPI: ${request.details.upiId}`}
                                        {request.type === 'debit' && request.details?.redeemOption === 'google_play' && `GPlay: ${request.details.googlePlayPackage?.name}`}
                                    </TableCell>
                                    <TableCell>{format(new Date(request.date), 'PPp')}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {request.type === 'debit' && request.details?.redeemOption === 'google_play' ? (
                                            <SendCodeDialog request={request} onConfirm={handleRequest} />
                                        ) : (
                                            <Button 
                                                size="icon" 
                                                variant="ghost" 
                                                className="text-green-500" 
                                                onClick={() => handleRequest(request, 'approved')}>
                                                <Check className="w-5 h-5" />
                                            </Button>
                                        )}
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

                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>All Transactions</CardTitle>
                        <CardDescription>A log of all transactions happening on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allTransactions.map(tx => (
                                        <TableRow key={tx.id}>
                                            <TableCell className="max-w-[150px] truncate">{tx.userId}</TableCell>
                                            <TableCell>{tx.description}</TableCell>
                                            <TableCell>{format(new Date(tx.date), 'Pp')}</TableCell>
                                            <TableCell className={cn(
                                                'text-right font-semibold flex items-center justify-end gap-1',
                                                tx.type === 'credit' ? 'text-accent' : 'text-destructive'
                                            )}>
                                                {tx.type === 'credit' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                                {tx.amount.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>

                 <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>All Tournaments</CardTitle>
                        <CardDescription>View and manage all live and upcoming tournaments.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Game</TableHead>
                                        <TableHead>Prize Pool</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allTournaments.map(t => (
                                        <TableRow key={t.id}>
                                            <TableCell className="font-medium">{t.title}</TableCell>
                                            <TableCell>{t.gameName}</TableCell>
                                            <TableCell>{t.prizePool.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={t.status === 'Upcoming' ? 'secondary' : 'default'}>{t.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DeleteTournamentDialog tournament={t} onDelete={deleteTournament} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </div>
  );
}


function SendCodeDialog({ request, onConfirm }: { request: CoinRequest, onConfirm: (request: CoinRequest, status: 'approved' | 'rejected', code?: string) => void }) {
    const [open, setOpen] = useState(false);
    const [code, setCode] = useState('');
    const { toast } = useToast();

    const handleConfirm = () => {
        if (!code.trim()) {
            toast({ variant: 'destructive', title: 'Invalid Code', description: 'Please enter a valid Google Play redeem code.' });
            return;
        }
        onConfirm(request, 'approved', code);
        setOpen(false);
        setCode('');
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="text-green-500">
                    <Check className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                 <DialogHeader>
                    <DialogTitle>Send Google Play Redeem Code</DialogTitle>
                    <DialogDescription>
                        Approve the request for a {request.details?.googlePlayPackage?.name} and send the code to the user.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Label htmlFor="redeemCode">Redeem Code</Label>
                    <Textarea id="redeemCode" value={code} onChange={e => setCode(e.target.value)} placeholder="Enter Google Play code here..." />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleConfirm}>Approve & Send Code</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function DeleteTournamentDialog({ tournament, onDelete }: { tournament: Tournament, onDelete: (id: string) => void}) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" className="h-8 w-8">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the tournament
                        "{tournament.title}".
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(tournament.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

