
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Tournament } from '@/lib/types';
import { addTournament } from '@/lib/data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from 'next/link';
import { placeholderImages } from '@/lib/placeholder-images.json';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Copy, CircleDollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function ProfilePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.email === 'rajshukla381@gmail.com';
  const [title, setTitle] = useState('');
  const [gameName, setGameName] = useState<'Free Fire' | 'BGMI' | 'Valorant' | ''>('');
  const [entryFee, setEntryFee] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [host, setHost] = useState('');
  const [rules, setRules] = useState('');
  const [matchTime, setMatchTime] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  useEffect(() => {
    // Set initial match time only on the client to avoid hydration mismatch
    setMatchTime(new Date().toISOString().slice(0, 16));
  }, []);

  const adminUpiId = '9106059600@fam';
  const feePercentage = 0.20;
  const prizePoolAmount = parseInt(prizePool) || 0;
  const feeAmount = prizePoolAmount * feePercentage;
  const totalAmount = prizePoolAmount + feeAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !gameName || !entryFee || !prizePool || !host || !rules || !matchTime) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill out all fields to create a tournament.',
      });
      return;
    }
    if (isAdmin) {
      handlePaymentConfirm();
    } else {
      setShowPaymentDialog(true);
    }
  };
  
  const handlePaymentConfirm = async () => {
    setShowPaymentDialog(false);
    
    const ffBanner = placeholderImages.find(p => p.id === 'game-ff');
    const bgmiBanner = placeholderImages.find(p => p.id === 'game-bgmi');
    const valorantBanner = placeholderImages.find(p => p.id === 'game-valorant');

    let imageUrl = '';
    let imageHint = '';

    switch (gameName) {
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
      title,
      gameName,
      entryFee: parseInt(entryFee),
      prizePool: parseInt(prizePool),
      host,
      rules,
      matchTime: new Date(matchTime).toISOString(),
      status: 'Upcoming',
      imageUrl,
      imageHint
    };

    // In a real app, this would be a request to the admin for approval
    await addTournament(newTournament);

    toast({
      title: 'Tournament Request Sent!',
      description: `Your tournament "${title}" has been submitted for admin approval.`,
    });

    // Reset form
    setTitle('');
    setGameName('');
    setEntryFee('');
    setPrizePool('');
    setHost('');
    setRules('');
    setMatchTime(new Date().toISOString().slice(0, 16));
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(adminUpiId);
    toast({ title: 'Copied!', description: 'UPI ID copied to clipboard.' });
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
        <div className="w-full max-w-4xl space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-glow-primary">Profile & Create</h1>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Create New Tournament</CardTitle>
                    <CardDescription>Fill in the details below to host your own tournament. You will be required to provide the prize pool amount in coins, plus a 20% service fee.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Tournament Title</Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Summer Skirmish" />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="gameName">Game</Label>
                        <Select onValueChange={(value: 'Free Fire' | 'BGMI' | 'Valorant') => setGameName(value)} value={gameName}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a game" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Free Fire">Free Fire</SelectItem>
                                <SelectItem value="BGMI">BGMI</SelectItem>
                                <SelectItem value="Valorant">Valorant</SelectItem>
                            </SelectContent>
                        </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="entryFee">Entry Fee (Coins)</Label>
                            <Input id="entryFee" type="number" value={entryFee} onChange={(e) => setEntryFee(e.target.value)} placeholder="e.g., 100" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="prizePool">Prize Pool (Coins)</Label>
                            <Input id="prizePool" type="number" value={prizePool} onChange={(e) => setPrizePool(e.target.value)} placeholder="e.g., 10000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="host">Host</Label>
                            <Input id="host" value={host} onChange={(e) => setHost(e.target.value)} placeholder="e.g., Your Org Name" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="matchTime">Match Time</Label>
                            <Input id="matchTime" type="datetime-local" value={matchTime} onChange={(e) => setMatchTime(e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rules">Rules & Information</Label>
                        <Textarea id="rules" value={rules} onChange={(e) => setRules(e.target.value)} placeholder="Enter tournament rules and other info" className="min-h-[120px]" />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <Link href="/" passHref>
                           <Button variant="outline" type="button">Back to Tournaments</Button>
                        </Link>
                        <Button type="submit">Create Tournament</Button>
                    </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  Become a Main Admin
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  To get full administrative privileges, please send a request to the following email address:
                </p>
                <a
                  href="mailto:rajshukla381@gmail.com"
                  className="text-lg font-semibold text-accent text-glow-accent hover:underline"
                >
                  rajshukla381@gmail.com
                </a>
              </CardContent>
            </Card>
        </div>
      </main>

       <AlertDialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Coin Payment Required</AlertDialogTitle>
            <AlertDialogDescription>
              To create your tournament, you need to provide the prize pool and a service fee in coins. This amount will be deducted from your wallet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
              <div className="text-sm">
                  <div className="flex justify-between items-center"><span>Prize Pool:</span> <span className="flex items-center gap-1"><CircleDollarSign className="w-4 h-4"/>{prizePoolAmount.toLocaleString()}</span></div>
                  <div className="flex justify-between items-center"><span>Service Fee (20%):</span> <span className="flex items-center gap-1"><CircleDollarSign className="w-4 h-4"/>{feeAmount.toLocaleString()}</span></div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Total Cost:</span> <span className="flex items-center gap-1"><CircleDollarSign className="w-4 h-4"/>{totalAmount.toLocaleString()}</span></div>
              </div>
              <div className="bg-muted/50 p-4 rounded-md text-center space-y-2">
                <Label>This amount will be deducted from your wallet for admin approval.</Label>
              </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePaymentConfirm}>Confirm & Create</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
