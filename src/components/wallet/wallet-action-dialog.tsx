
'use client';

import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy } from 'lucide-react';

type WalletActionDialogProps = {
  action: 'credit' | 'debit';
  onConfirm: (amount: number, upiId?: string) => void;
  children: React.ReactNode;
};

export function WalletActionDialog({
  action,
  onConfirm,
  children,
}: WalletActionDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const { toast } = useToast();
  const adminUpiId = '9106059600@fam';

  const handleConfirm = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter a valid positive amount.',
      });
      return;
    }

    if (action === 'debit' && !upiId) {
      toast({
        variant: 'destructive',
        title: 'UPI ID Required',
        description: 'Please enter your UPI ID to request a withdrawal.',
      });
      return;
    }
    
    onConfirm(numAmount, action === 'debit' ? upiId : undefined);
    
    setAmount('');
    setUpiId('');
    setOpen(false);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(adminUpiId);
    toast({ title: 'Copied!', description: 'UPI ID copied to clipboard.' });
  }

  const creditContent = (
    <>
      <DialogHeader>
        <DialogTitle>Add Money</DialogTitle>
        <DialogDescription>
          Send your payment to the UPI ID below, then enter the amount to update your wallet.
        </DialogDescription>
      </DialogHeader>
      <div className="bg-muted/50 p-4 rounded-md text-center space-y-2">
        <Label>Pay to this UPI ID</Label>
        <div className="flex items-center justify-center gap-2 p-2 bg-background rounded-md">
            <p className="text-lg font-mono">{adminUpiId}</p>
            <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                <Copy className="h-4 w-4"/>
            </Button>
        </div>
      </div>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="amount" className="text-right">
            Amount
          </Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="col-span-3"
            placeholder="₹0.00"
          />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={handleConfirm}>Add to Wallet</Button>
      </DialogFooter>
    </>
  );

  const debitContent = (
    <>
      <DialogHeader>
        <DialogTitle>Withdraw Money</DialogTitle>
        <DialogDescription>
          Enter your UPI ID and the amount to withdraw. Your request will be sent to an administrator for approval.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
         <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="amount" className="text-right">
            Amount
          </Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="col-span-3"
            placeholder="₹0.00"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="upiId" className="text-right">
            Your UPI ID
          </Label>
          <Input
            id="upiId"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="col-span-3"
            placeholder="example@upi"
          />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={handleConfirm}>Request Withdrawal</Button>
      </DialogFooter>
    </>
  );


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        {action === 'credit' ? creditContent : debitContent}
      </DialogContent>
    </Dialog>
  );
}
