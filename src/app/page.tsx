
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import TournamentDetails from '@/components/tournaments/tournament-details';
import TournamentList from '@/components/tournaments/tournament-list';
import WalletHistory from '@/components/wallet/wallet-history';
import { getTournaments, getTransactions } from '@/lib/data';
import type { Tournament, Transaction } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const router = useRouter();


  useEffect(() => {
    if(!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  useState(() => {
    getTournaments().then(setTournaments);
    getTransactions().then(setTransactions);
  });

  const searchParams = useSearchParams();
  const tournamentId = searchParams.get('tournamentId');

  const selectedTournamentId = tournamentId ?? tournaments[0]?.id ?? null;
  const selectedTournament =
    tournaments.find((t) => t.id === selectedTournamentId) ?? tournaments[0];
  
  const currentBalance = transactions.reduce((acc, t) => {
    return t.type === 'credit' ? acc + t.amount : acc - t.amount;
  }, 0);

  const handleJoinTournament = (tournament: Tournament) => {
    if (currentBalance < tournament.entryFee) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Funds',
        description: `You need at least ₹${tournament.entryFee} to join.`,
      });
      return;
    }

    const newTransaction: Transaction = {
      id: `t${transactions.length + 1}`,
      date: new Date().toISOString(),
      description: `Entry for ${tournament.title}`,
      amount: tournament.entryFee,
      type: 'debit',
    };
    setTransactions([newTransaction, ...transactions]);
    toast({
      title: 'Tournament Joined!',
      description: `Successfully joined ${tournament.title}. Good luck!`,
    });
  };

  const handleWalletAction = (type: 'credit' | 'debit', amount: number, upiId?: string, screenshot?: File) => {
    if (type === 'debit') {
      if (amount > currentBalance) {
        toast({
          variant: 'destructive',
          title: 'Insufficient Funds',
          description: 'You cannot withdraw more than your current balance.',
        });
        return;
      }
      toast({
        title: 'Withdrawal Request Sent',
        description: `Your request to withdraw ₹${amount.toLocaleString()} to ${upiId} has been sent to the admin for approval.`,
      });
      // In a real app, you would not deduct this immediately. 
      // We are not creating a transaction here as it needs admin approval.
      // We will just show a notification.
      return;
    }

    if (type === 'credit') {
      toast({
        title: 'Deposit Request Sent',
        description: `Your request to deposit ₹${amount.toLocaleString()} has been sent to the admin for approval. Screenshot: ${screenshot?.name}`,
      });
      // In a real app, you would not credit this immediately.
      // We are not creating a transaction here as it needs admin approval.
      return;
    }
  };

  if (loading || !user) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-screen-2xl mx-auto">
            <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </aside>
            <section className="lg:col-span-8 xl:col-span-5">
              <Skeleton className="h-full w-full" />
            </section>
            <aside className="lg:col-span-12 xl:col-span-4">
              <Skeleton className="h-full w-full" />
            </aside>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-screen-2xl mx-auto">
          <aside className="lg:col-span-4 xl:col-span-3">
            <TournamentList
              tournaments={tournaments}
              activeTournamentId={selectedTournamentId}
              onJoin={handleJoinTournament}
            />
          </aside>
          <section className="lg:col-span-8 xl:col-span-5">
            {selectedTournament ? (
              <TournamentDetails
                tournament={selectedTournament}
                onJoin={handleJoinTournament}
              />
            ) : (
              <div className="flex items-center justify-center h-full rounded-lg bg-card border">
                <p className="text-muted-foreground">
                  Select a tournament to see details
                </p>
              </div>
            )}
          </section>
          <aside className="lg:col-span-12 xl:col-span-4">
            <WalletHistory
              transactions={transactions}
              onWalletAction={handleWalletAction}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}
