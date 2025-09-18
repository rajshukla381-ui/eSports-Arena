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
import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';
import { Badge } from '../ui/badge';

type WalletHistoryProps = {
  transactions: Transaction[];
};

export default function WalletHistory({ transactions }: WalletHistoryProps) {
  const currentBalance = transactions.reduce((acc, t) => {
    return t.type === 'credit' ? acc + t.amount : acc - t.amount;
  }, 0);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4">
        <Wallet className="w-8 h-8 text-primary" />
        <div>
          <CardTitle className="text-2xl font-bold">Wallet</CardTitle>
          <p className="text-3xl font-bold mt-2">
            ₹{currentBalance.toLocaleString()}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <h3 className="font-semibold">Transaction History</h3>
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
                      'text-right font-semibold',
                      transaction.type === 'credit' ? 'text-accent' : 'text-destructive'
                    )}
                  >
                    {transaction.type === 'credit' ? '+' : '-'}₹
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
