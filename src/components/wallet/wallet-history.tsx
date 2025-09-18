
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
import { Transaction, CoinRequest } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight, CircleDollarSign, Infinity } from 'lucide-react';
import { Button } from '../ui/button';
import { WalletActionDialog } from './wallet-action-dialog';
import { useAuth } from '@/hooks/use-auth';

type WalletHistoryProps = {
  transactions: Transaction[];
  onWalletAction: (request: Omit<CoinRequest, 'id' | 'date' | 'status' | 'userId'>) => void;
  onRedeemCode: (code: string, amount: number) => void;
  onNewTransaction: () => void;
};

export default function WalletHistory({ transactions, onWalletAction, onRedeemCode, onNewTransaction }: WalletHistoryProps) {
  const { user } = useAuth();
  const isAdmin = user?.email === 'rajshukla381@gmail.com';

  const currentBalance = transactions.reduce((acc, t) => {
    return t.type === 'credit' ? acc + t.amount : acc - t.amount;
  }, 0);


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
                <p>{currentBalance.toLocaleString()} <span className="text-lg text-muted-foreground">Points</span></p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4">
          <WalletActionDialog
            action="credit"
            onConfirm={(request) => onWalletAction(request)}
            onRedeemCode={onRedeemCode}
          >
            <Button className="w-full">Get Points</Button>
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
