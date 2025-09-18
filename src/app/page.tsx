
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import TournamentDetails from '@/components/tournaments/tournament-details';
import TournamentList from '@/components/tournaments/tournament-list';
import WalletHistory from '@/components/wallet/wallet-history';
import { getTournaments, getTransactions, addTransaction } from '@/lib/data';
import { addCoinRequest } from '@/lib/requests';
import type { Tournament, Transaction } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

export default function Home() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.email === 'rajshukla381@gmail.com';

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchAndSetData = useCallback(() => {
    if(user) {
      Promise.all([getTournaments(), getTransactions(user.email)]).then(([tournaments, userTransactions]) => {
        setTournaments(tournaments);
        setTransactions(userTransactions);
        setLoading(false);
      });
    }
  }, [user]);

  useEffect(() => {
    fetchAndSetData();
  }, [fetchAndSetData]);

  const searchParams = useSearchParams();
  const tournamentId = searchParams.get('tournamentId');

  const selectedTournamentId = tournamentId ?? tournaments[0]?.id ?? null;
  const selectedTournament =
    tournaments.find((t) => t.id === selectedTournamentId) ?? tournaments[0];
  
  const currentBalance = transactions.reduce((acc, t) => {
    return t.type === 'credit' ? acc + t.amount : acc - t.amount;
  }, 0);

  const handleJoinTournament = (tournament: Tournament) => {
    if (!isAdmin && currentBalance < tournament.entryFee) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Coins',
        description: `You need at least ${tournament.entryFee} coins to join.`,
      });
      return;
    }

    const newTransaction: Transaction = {
      id: `t-${Date.now()}`,
      date: new Date().toISOString(),
      description: `Entry for ${tournament.title}`,
      amount: tournament.entryFee,
      type: 'debit',
      userId: user!.email,
    };
    if (!isAdmin) {
      addTransaction(newTransaction);
      setTransactions([newTransaction, ...transactions]);
    }
    toast({
      title: 'Tournament Joined!',
      description: `Successfully joined ${tournament.title}. Good luck!`,
    });
  };

  const handleWalletAction = (type: 'credit' | 'debit', amount: number, upiId?: string, screenshot?: File) => {
    if (!user) return;

    if (type === 'debit') {
      if (amount > currentBalance && !isAdmin) {
        toast({
          variant: 'destructive',
          title: 'Insufficient Coins',
          description: 'You cannot redeem more coins than your current balance.',
        });
        return;
      }
    }

    addCoinRequest({
      userId: user.email,
      type,
      amount,
      upiId,
      screenshot: screenshot?.name,
    });

    if (type === 'credit') {
        toast({
            title: 'Coin Request Sent',
            description: `Your request to add ${amount.toLocaleString()} coins has been sent to the admin for approval.`,
        });
    } else {
        toast({
            title: 'Redemption Request Sent',
            description: `Your request to redeem ${amount.toLocaleString()} coins to ${upiId} has been sent for approval.`,
        });
    }
  };

  const handleRedeemCodeAction = (code: string, amount: number) => {
      if (!user) return;
      addCoinRequest({
          userId: user.email,
          type: 'credit',
          amount,
          redeemCode: code,
      });
  }

  const handleDeclareWinner = (tournament: Tournament, winnerEmail: string, prizeAmount: number) => {
    const newTransaction: Transaction = {
        id: `t-win-${Date.now()}`,
        date: new Date().toISOString(),
        description: `Prize for ${tournament.title}`,
        amount: prizeAmount,
        type: 'credit',
        userId: winnerEmail,
    };
    addTransaction(newTransaction);

    toast({
      title: 'Winner Declared!',
      description: `${winnerEmail} has been awarded ${prizeAmount.toLocaleString()} coins for winning ${tournament.title}.`,
    });

    // If the winner is the current user, update their view
    if (user?.email === winnerEmail) {
        setTransactions([newTransaction, ...transactions]);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-screen-2xl mx-auto">
            <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
              <Skeleton className="h-[calc(100vh-10rem)]" />
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
  
  if (!user) {
    return null; // or a loading indicator, as the redirect is happening
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
                isAdmin={isAdmin}
                onDeclareWinner={handleDeclareWinner}
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
              onRedeemCode={handleRedeemCodeAction}
              onNewTransaction={fetchAndSetData}
              key={transactions.length} // Force re-render on transaction change
            />
          </aside>
        </div>
      </main>
    </div>
  );
}
