
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Transaction } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight, CircleDollarSign, Infinity } from 'lucide-react';
import { Button } from '../ui/button';
import { WalletActionDialog } from './wallet-action-dialog';
import { useAuth } from '@/hooks/use-auth';
import { redeemCode } from '@/ai/flows/redeem-code';
import { useToast } from '@/hooks/use-toast';
import { addTransaction } from '@/lib/data';

type WalletHistoryProps = {
  transactions: Transaction[];
  onWalletAction: (type: 'credit' | 'debit', amount: number, upiId?: string, screenshot?: File) => void;
  onNewTransaction: () => void;
};

export default function WalletHistory({ transactions, onWalletAction, onNewTransaction }: WalletHistoryProps) {
  const { user } = useAuth();
  const isAdmin = user?.email === 'rajshukla381@gmail.com';
  const { toast } = useToast();

  const currentBalance = transactions.reduce((acc, t) => {
    return t.type === 'credit' ? acc + t.amount : acc - t.amount;
  }, 0);

  const handleRedeemCode = async (code: string) => {
    if (!user) return false;

    const result = await redeemCode({ code, userId: user.email });

    if (result.success) {
      await addTransaction({
        userId: user.email,
        date: new Date().toISOString(),
        description: `Redeemed Code: ${code}`,
        amount: result.amount || 0,
        type: 'credit',
      });
      toast({
        title: 'Code Redeemed!',
        description: `You received ${result.amount} coins!`,
      });
      onNewTransaction();
      return true;
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid Code',
        description: result.message || 'The entered code is not valid.',
      });
      return false;
    }
  };


  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4">
        <CircleDollarSign className="w-8 h-8 text-primary" />
        <div>
          <CardTitle className="text-2xl font-bold">Wallet</CardTitle>
          <div className="text-3xl font-bold mt-2 flex items-center gap-2">
            {isAdmin ? (
                <Infinity className="w-8 h-8" />
            ) : (
                <p>{currentBalance.toLocaleString()} <span className="text-lg text-muted-foreground">Coins</span></p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <WalletActionDialog
            action="credit"
            onConfirm={(amount, _, screenshot) => onWalletAction('credit', amount, undefined, screenshot)}
            onRedeemCode={handleRedeemCode}
          >
            <Button>Get Coins</Button>
          </WalletActionDialog>
          <WalletActionDialog
            action="debit"
            onConfirm={(amount, upiId) => onWalletAction('debit', amount, upiId)}
            onRedeemCode={handleRedeemCode}
          >
            <Button variant="outline">Redeem</Button>
          </WalletActionDialog>
        </div>
        <h3 className="font-semibold pt-4">Transaction History</h3>
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                       {transaction.type === 'credit' ? (
                          <ArrowUpRight className="w-5 h-5 text-accent" />
                        ) : (
                          <ArrowDownLeft className="w-5 h-5 text-destructive" />
                        )}
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(transaction.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-semibold flex items-center justify-end gap-1',
                      transaction.type === 'credit' ? 'text-accent' : 'text-destructive'
                    )}
                  >
                    {transaction.type === 'credit' ? '+' : '-'}
                    <CircleDollarSign className="w-4 h-4"/>
                    {transaction.amount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
