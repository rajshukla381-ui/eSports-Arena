
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
import { addCoinRequest } from '@/lib/requests';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from 'next/link';
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
  const [title, setTitle] = useState('');
  const [gameName, setGameName] = useState<'Free Fire' | 'BGMI' | 'Valorant' | ''>('');
  const [prizePool, setPrizePool] = useState('');
  const [host, setHost] = useState('');
  const [rules, setRules] = useState('');
  const [matchTime, setMatchTime] = useState('');

  useEffect(() => {
    // Set initial match time only on the client to avoid hydration mismatch
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setMatchTime(now.toISOString().slice(0, 16));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !gameName || !prizePool || !host || !rules || !matchTime) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill out all fields to create a tournament.',
      });
      return;
    }
    
    if (!user || !gameName) return;

    const tournamentDetails: Omit<Tournament, 'id' | 'status' | 'imageUrl' | 'imageHint' | 'entryFee'> = {
      title,
      gameName,
      prizePool: parseInt(prizePool),
      host,
      rules,
      matchTime: new Date(matchTime).toISOString(),
    };

    await addCoinRequest({
      userId: user.email,
      type: 'tournament_creation',
      amount: 0, // No cost to create a tournament
      tournamentDetails: {
        ...tournamentDetails,
        entryFee: 0 // Tournaments are free to join
      },
    });
    
    toast({
      title: 'Tournament Request Sent!',
      description: `Your tournament "${title}" has been submitted for admin approval.`,
    });

    // Reset form
    setTitle('');
    setGameName('');
    setPrizePool('');
    setHost('');
    setRules('');
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setMatchTime(now.toISOString().slice(0, 16));
  };
  
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
                    <CardDescription>Fill in the details below to host your own tournament. All tournaments are free to join and winnings are distributed as points.</CardDescription>
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
                            <Label htmlFor="prizePool">Prize Pool (Points)</Label>
                            <Input id="prizePool" type="number" value={prizePool} onChange={(e) => setPrizePool(e.target.value)} placeholder="e.g., 10000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="host">Host</Label>
                            <Input id="host" value={host} onChange={(e) => setHost(e.target.value)} placeholder="e.g., Your Org Name" />
                        </div>
                         <div className="space-y-2 md:col-span-2">
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
    </div>
  );
}
