
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { addTransaction, getTransactions } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import SpinWheel from '@/components/spin-wheel/spin-wheel';
import { Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const LAST_SPIN_KEY = 'last_spin_date';

export default function SpinPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [canSpin, setCanSpin] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      try {
        const lastSpinDate = localStorage.getItem(`${LAST_SPIN_KEY}_${user.email}`);
        if (!lastSpinDate) {
          setCanSpin(true);
        } else {
          const today = new Date().toDateString();
          if (lastSpinDate !== today) {
            setCanSpin(true);
          } else {
            setCanSpin(false);
          }
        }
      } catch (error) {
        // localStorage is not available
        setCanSpin(false);
      }
    }
  }, [user]);

  const handleSpinFinish = (prize: number) => {
    if (!user) return;

    setIsSpinning(false);

    if (prize > 0) {
        const newTransaction: Omit<Transaction, 'id'> = {
            userId: user.email,
            date: new Date().toISOString(),
            description: 'Daily Spin Prize',
            amount: prize,
            type: 'credit',
        };
        addTransaction(newTransaction);
        toast({
            title: 'Congratulations!',
            description: `You won ${prize.toLocaleString()} coins! It has been added to your wallet.`,
        });
    } else {
        toast({
            title: 'Better Luck Next Time!',
            description: 'You didn\'t win a prize this time. Try again tomorrow!',
        });
    }

    try {
        const today = new Date().toDateString();
        localStorage.setItem(`${LAST_SPIN_KEY}_${user.email}`, today);
    } catch (error) {
        // localStorage is not available
    }
    setCanSpin(false);
  };

  if (authLoading || !user) {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                <p>Loading...</p>
            </main>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-md text-center">
            <Card className="shadow-glow-primary">
                <CardHeader>
                    <CardTitle className="text-4xl font-bold text-glow-primary">Spin & Win!</CardTitle>
                    <CardDescription>You get one free spin every day. Good luck!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <SpinWheel onSpinFinish={handleSpinFinish} startSpin={isSpinning} />
                    {canSpin ? (
                        <Button
                            size="lg"
                            className="w-full text-lg font-bold"
                            onClick={() => setIsSpinning(true)}
                            disabled={isSpinning}
                        >
                            {isSpinning ? 'Spinning...' : 'SPIN THE WHEEL'}
                        </Button>
                    ) : (
                        <div className="text-center space-y-4">
                            <p className="text-muted-foreground">You've already used your free spin for today. Come back tomorrow!</p>
                             <Link href="/" passHref>
                                <Button variant="outline">Back to Tournaments</Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
