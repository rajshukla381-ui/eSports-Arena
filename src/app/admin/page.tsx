
'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Tournament } from '@/lib/types';
import { getTournaments, addTournament } from '@/lib/data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from 'next/link';
import { placeholderImages } from '@/lib/placeholder-images.json';


export default function AdminPage() {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [gameName, setGameName] = useState<'Free Fire' | 'BGMI' | 'Valorant' | ''>('');
  const [entryFee, setEntryFee] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [host, setHost] = useState('');
  const [rules, setRules] = useState('');
  const [matchTime, setMatchTime] = useState(new Date().toISOString().slice(0, 16));

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

    await addTournament(newTournament);

    toast({
      title: 'Tournament Created!',
      description: `The "${title}" tournament has been successfully created.`,
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

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
        <div className="w-full max-w-4xl space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-glow-primary">Admin Panel</h1>
                <p className="text-muted-foreground">Create and manage tournaments</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Create New Tournament</CardTitle>
                    <CardDescription>Fill in the details below to add a new tournament.</CardDescription>
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
                            <Label htmlFor="entryFee">Entry Fee (₹)</Label>
                            <Input id="entryFee" type="number" value={entryFee} onChange={(e) => setEntryFee(e.target.value)} placeholder="e.g., 100" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="prizePool">Prize Pool (₹)</Label>
                            <Input id="prizePool" type="number" value={prizePool} onChange={(e) => setPrizePool(e.target.value)} placeholder="e.g., 10000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="host">Host</Label>
                            <Input id="host" value={host} onChange={(e) => setHost(e.target.value)} placeholder="e.g., Your Org" />
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
        </div>
      </main>
    </div>
  );
}
