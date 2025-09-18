
'use client';

import { useState } from 'react';
import Image from 'next/image';
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
import { Copy, Upload, CircleDollarSign, Gift } from 'lucide-react';
import { coinPackages } from '@/lib/coin-packages.json';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type WalletActionDialogProps = {
  action: 'credit' | 'debit';
  onConfirm: (amount: number, upiId?: string, screenshot?: File) => void;
  onNewTransaction: () => void;
  children: React.ReactNode;
};

export function WalletActionDialog({
  action,
  onConfirm,
  onNewTransaction,
  children,
}: WalletActionDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotName, setScreenshotName] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<(typeof coinPackages[0]) | null>(null);
  
  const { toast } = useToast();
  const adminUpiId = '9106059600@fam';

  const handleConfirm = () => {
    const numAmount = selectedPackage ? selectedPackage.amount : parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please select a package or enter a valid amount.',
      });
      return;
    }

    if (action === 'credit') {
        if (!selectedPackage) {
            toast({
                variant: 'destructive',
                title: 'No Package Selected',
                description: 'Please select a coin package to continue.',
            });
            return;
        }

        if (activeTab === 'upi' && !screenshot) {
             toast({
                variant: 'destructive',
                title: 'Screenshot Required',
                description: 'Please upload a screenshot of your payment.',
            });
            return;
        }

        // Simulate Google Play payment
        if (activeTab === 'google-play') {
            onConfirm(numAmount, undefined, undefined);
            onNewTransaction();
        } else { // UPI payment
            onConfirm(numAmount, undefined, screenshot!);
        }

    } else { // Debit action
        if (!upiId) {
            toast({
                variant: 'destructive',
                title: 'UPI ID Required',
                description: 'Please enter your UPI ID to request a redemption.',
            });
            return;
        }
        onConfirm(numAmount, upiId, undefined);
    }
    
    resetState();
    setOpen(false);
  };
  
  const resetState = () => {
    setAmount('');
    setUpiId('');
    setScreenshot(null);
    setScreenshotName('');
    setSelectedPackage(null);
    setActiveTab('upi');
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshot(file);
      setScreenshotName(file.name);
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(adminUpiId);
    toast({ title: 'Copied!', description: 'UPI ID copied to clipboard.' });
  }
  
  const [activeTab, setActiveTab] = useState('upi');

  const GooglePlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24">
        <path fill="#4CAF50" d="M3.1,2.5l9,5.2l-9,5.2V2.5z"/>
        <path fill="#F44336" d="M3,12.9l9.2,5.3L20.8,12l-8.6-4.9L3,12.9z"/>
        <path fill="#FFC107" d="M3.1,18.1l9-5.2V2.5L3.1,7.7V18.1z"/>
        <path fill="#2196F3" d="M12.1,12.9l8.6-4.9L12.1,2.5v10.4H12.1z"/>
    </svg>
  );

  const creditContent = (
    <>
        <DialogHeader>
            <DialogTitle>Get Gaming Coins</DialogTitle>
            <DialogDescription>
            Choose how you want to add coins to your wallet.
            </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground px-1">
                Select a coin package to get started.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[200px] overflow-y-auto pr-2">
                {coinPackages.map(pkg => (
                    <div key={pkg.id} 
                        className={cn(
                            "relative border-2 rounded-lg p-3 text-center cursor-pointer transition-all bg-card hover:border-primary/80",
                            selectedPackage?.id === pkg.id ? 'border-primary shadow-glow-primary' : 'border-transparent'
                        )}
                        onClick={() => setSelectedPackage(pkg)}>
                        <Image src={pkg.imageUrl} alt={`${pkg.amount} coins`} width={100} height={100} className="mx-auto mb-2" data-ai-hint={pkg.imageHint} />
                        <div>
                        <div className="font-bold flex items-center justify-center gap-1 text-lg">
                            <CircleDollarSign className="w-5 h-5 text-primary" /> {pkg.amount.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">₹{pkg.price.toLocaleString()}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {selectedPackage && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upi"><Upload className="w-4 h-4 mr-2"/>Pay via UPI</TabsTrigger>
                    <TabsTrigger value="google-play"><GooglePlayIcon />Pay with Google</TabsTrigger>
                </TabsList>
                <TabsContent value="upi">
                    <div className="py-4 space-y-4 animate-in fade-in-0">
                        <div className="bg-muted/50 p-4 rounded-md text-center space-y-2">
                            <Label>Pay ₹{selectedPackage.price.toLocaleString()} to this UPI ID</Label>
                            <div className="flex items-center justify-center gap-2 p-2 bg-background rounded-md">
                                <p className="text-lg font-mono">{adminUpiId}</p>
                                <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                                    <Copy className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="screenshot" className="text-right">
                                Screenshot
                            </Label>
                            <div className="col-span-3">
                                <Button asChild variant="outline" className="w-full justify-start font-normal">
                                <Label htmlFor="screenshot-file" className="w-full flex items-center gap-2 cursor-pointer">
                                    <Upload className="w-4 h-4" />
                                    <span>{screenshotName || 'Upload payment proof'}</span>
                                </Label>
                                </Button>
                                <Input id="screenshot-file" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                        <Button variant="outline" onClick={resetState}>Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleConfirm} disabled={!selectedPackage || !screenshot}>Send Request</Button>
                    </DialogFooter>
                </TabsContent>
                <TabsContent value="google-play">
                    <div className="space-y-4 py-4 text-center">
                        <p className="text-muted-foreground">
                            You are about to purchase {selectedPackage.amount.toLocaleString()} coins for ₹{selectedPackage.price.toLocaleString()} using Google Play.
                        </p>
                        <GooglePlayIcon />
                        <p className="text-xs text-muted-foreground">This is a simulated payment for demonstration.</p>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" onClick={resetState}>Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleConfirm} disabled={!selectedPackage}>
                            Pay ₹{selectedPackage.price}
                        </Button>
                    </DialogFooter>
                </TabsContent>
            </Tabs>
        )}
    </>
  );

  const debitContent = (
    <>
      <DialogHeader>
        <DialogTitle>Redeem Coins</DialogTitle>
        <DialogDescription>
          Enter your UPI ID and the amount of coins to redeem. Your request will be sent to an administrator for approval.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
         <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="amount" className="text-right">
            Coin Amount
          </Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="col-span-3"
            placeholder="e.g., 10000"
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
          <Button variant="outline" onClick={resetState}>Cancel</Button>
        </DialogClose>
        <Button onClick={handleConfirm}>Request Redemption</Button>
      </DialogFooter>
    </>
  );


  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) resetState();
        setOpen(isOpen);
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        {action === 'credit' ? creditContent : debitContent}
      </DialogContent>
    </Dialog>
  );
}
