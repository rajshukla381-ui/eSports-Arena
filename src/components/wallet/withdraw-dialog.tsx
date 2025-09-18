

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
import { CoinRequest } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { googlePlayPackages } from '@/lib/google-play-packages.json';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { CircleDollarSign } from 'lucide-react';


type WithdrawDialogProps = {
  onConfirm: (request: Omit<CoinRequest, 'id' | 'date' | 'status' | 'userId'>) => void;
  children: React.ReactNode;
  currentBalance: number;
};

const GST_RATE = 0.18;
const PLATFORM_FEE_RATE = 0.10;

export function WithdrawDialog({ onConfirm, children, currentBalance }: WithdrawDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [activeTab, setActiveTab] = useState('upi');
  const [selectedGPlayPackage, setSelectedGPlayPackage] = useState<string | undefined>(undefined);

  const { toast } = useToast();

  const handleConfirm = () => {
    if (activeTab === 'upi') {
      const numAmount = parseInt(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid amount to withdraw.' });
        return;
      }
      if (numAmount > currentBalance) {
        toast({ variant: 'destructive', title: 'Insufficient Balance', description: 'You cannot withdraw more than your current balance.' });
        return;
      }
       if (!upiId.trim() || !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId)) {
        toast({ variant: 'destructive', title: 'Invalid UPI ID', description: 'Please enter a valid UPI ID.' });
        return;
      }

      const { finalAmount, gst, platformFee } = calculateFees(numAmount);
      onConfirm({
        type: 'debit',
        amount: numAmount,
        originalAmount: numAmount,
        details: {
          redeemOption: 'upi',
          upiId,
          finalAmount,
          gst,
          platformFee
        }
      });
      toast({
        title: 'Request Sent',
        description: `Your withdrawal request for ${numAmount.toLocaleString()} points has been sent for approval.`,
      });

    } else if (activeTab === 'google_play') {
      const pkg = googlePlayPackages.find(p => p.id === selectedGPlayPackage);
      if (!pkg) {
        toast({ variant: 'destructive', title: 'No Package Selected', description: 'Please select a Google Play package.' });
        return;
      }
      if (pkg.coins > currentBalance) {
        toast({ variant: 'destructive', title: 'Insufficient Balance', description: `You need ${pkg.coins.toLocaleString()} points for this package.` });
        return;
      }
      
      onConfirm({
        type: 'debit',
        amount: pkg.coins,
        details: {
          redeemOption: 'google_play',
          googlePlayPackage: {
            name: pkg.name,
            coins: pkg.coins
          }
        }
      });
      toast({
        title: 'Request Sent',
        description: `Your request for a ${pkg.name} has been sent for approval.`,
      });
    }
    
    resetState();
    setOpen(false);
  };
  
  const resetState = () => {
    setAmount('');
    setUpiId('');
    setSelectedGPlayPackage(undefined);
  }
  
  const calculateFees = (originalAmount: number) => {
      const gst = originalAmount * GST_RATE;
      const platformFee = originalAmount * PLATFORM_FEE_RATE;
      const finalAmount = originalAmount - gst - platformFee;
      return { finalAmount, gst, platformFee };
  }

  const numAmount = parseInt(amount) || 0;
  const { finalAmount, gst, platformFee } = calculateFees(numAmount);
  const finalInr = finalAmount / 10;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) resetState();
        setOpen(isOpen);
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw Points</DialogTitle>
          <DialogDescription>
            Choose your withdrawal method and follow the steps.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upi">UPI Transfer</TabsTrigger>
                <TabsTrigger value="google_play">Google Play Code</TabsTrigger>
            </TabsList>
            <TabsContent value="upi">
                <div className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="amount">Points to Withdraw (100 Coins = 10 INR)</Label>
                        <Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`e.g., 5000 (Max: ${currentBalance.toLocaleString()})`} />
                    </div>
                    {numAmount > 0 && (
                        <div className="text-sm text-muted-foreground space-y-2 p-3 bg-muted/50 rounded-md">
                            <p className="flex justify-between">Original Amount: <span>{numAmount.toLocaleString()} points</span></p>
                            <p className="flex justify-between">GST (18%): <span>- {gst.toLocaleString()} points</span></p>
                            <p className="flex justify-between">Platform Fee (10%): <span>- {platformFee.toLocaleString()} points</span></p>
                            <hr className="border-border my-1"/>
                            <p className="flex justify-between font-bold text-foreground">Final Payout: <span>{finalAmount.toLocaleString()} points (₹{finalInr.toFixed(2)})</span></p>
                        </div>
                    )}
                    <div>
                        <Label htmlFor="upiId">Your UPI ID</Label>
                        <Input id="upiId" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@bank" />
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="google_play">
                <div className="space-y-4 py-4">
                    <Label>Select a Google Play Redeem Code Package (177 Coins = 10 INR)</Label>
                    <RadioGroup value={selectedGPlayPackage} onValueChange={setSelectedGPlayPackage} className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
                        {googlePlayPackages.map(pkg => (
                            <Label key={pkg.id} htmlFor={pkg.id} className="flex items-center justify-between p-4 border rounded-md cursor-pointer hover:border-primary has-[:checked]:border-primary has-[:checked]:shadow-glow-primary">
                                <div>
                                    <p className="font-bold">{pkg.name}</p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <CircleDollarSign className="w-4 h-4"/> {pkg.coins.toLocaleString()} Points
                                    </p>
                                </div>
                                <RadioGroupItem value={pkg.id} id={pkg.id} />
                            </Label>
                        ))}
                    </RadioGroup>
                </div>
            </TabsContent>
        </Tabs>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={resetState}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleConfirm}>Send Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
