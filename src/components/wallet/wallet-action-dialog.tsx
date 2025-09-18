
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
import { redeemCode } from '@/ai/flows/redeem-code';
import { useAuth } from '@/hooks/use-auth';
import { CoinRequest } from '@/lib/types';

type WalletActionDialogProps = {
  action: 'credit' | 'debit';
  onConfirm: (request: Omit<CoinRequest, 'id' | 'date' | 'status' | 'userId'>) => void;
  onRedeemCode: (code: string, amount: number) => void;
  children: React.ReactNode;
};

const GST_RATE = 0.28;
const PLATFORM_FEE_RATE = 0.10;

export function WalletActionDialog({
  action,
  onConfirm,
  onRedeemCode,
  children,
}: WalletActionDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotName, setScreenshotName] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<(typeof coinPackages[0]) | null>(null);
  const [redeemCodeInput, setRedeemCodeInput] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const { user } = useAuth();
  
  const { toast } = useToast();
  const adminUpiId = '9106059600@fam';
  const [activeTab, setActiveTab] = useState('buy-coins');


  const handleRedeemCode = async () => {
    if (!redeemCodeInput || !user) return;
    setIsRedeeming(true);
    try {
        const result = await redeemCode({ code: redeemCodeInput });
        if (result.success) {
            onRedeemCode(redeemCodeInput, result.amount);
            toast({
                title: 'Request Sent!',
                description: 'Your redeem code request has been sent to the admin for approval.',
            });
            resetState();
            setOpen(false);
        } else {
            toast({
                variant: 'destructive',
                title: 'Invalid Code',
                description: result.message,
            });
        }
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Redemption Failed',
            description: 'An error occurred while trying to redeem the code.',
        });
    } finally {
        setIsRedeeming(false);
    }
  };


  const handleConfirm = () => {
    if (action === 'credit') {
        if (!selectedPackage) {
            toast({ variant: 'destructive', title: 'No Package Selected', description: 'Please select a coin package to continue.' });
            return;
        }

        if (!screenshot) {
             toast({ variant: 'destructive', title: 'Screenshot Required', description: 'Please upload a screenshot of your payment.' });
            return;
        }

        onConfirm({
            type: 'credit',
            amount: selectedPackage.amount,
            screenshot: screenshot.name,
        });

    } else { // Debit action
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid amount.' });
            return;
        }
        if (!upiId) {
            toast({ variant: 'destructive', title: 'UPI ID Required', description: 'Please enter your UPI ID to request a redemption.' });
            return;
        }

        const gst = numAmount * GST_RATE;
        const platformFee = numAmount * PLATFORM_FEE_RATE;
        const finalAmount = numAmount - gst - platformFee;

        onConfirm({
            type: 'debit',
            amount: finalAmount,
            originalAmount: numAmount,
            upiId: upiId,
        });
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
    setActiveTab('buy-coins');
    setRedeemCodeInput('');
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

  const creditContent = (
    <>
        <DialogHeader>
            <DialogTitle>Get Gaming Coins</DialogTitle>
            <DialogDescription>
            Choose how you want to add coins to your wallet.
            </DialogDescription>
        </DialogHeader>
       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buy-coins"><CircleDollarSign className="w-4 h-4 mr-2"/>Buy Coins</TabsTrigger>
                <TabsTrigger value="redeem-code"><Gift className="w-4 h-4 mr-2"/>Redeem Code</TabsTrigger>
            </TabsList>
            <TabsContent value="buy-coins">
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
                )}
                 <DialogFooter>
                    <DialogClose asChild>
                    <Button variant="outline" onClick={resetState}>Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleConfirm} disabled={!selectedPackage || !screenshot}>Send Request</Button>
                </DialogFooter>
            </TabsContent>
            <TabsContent value="redeem-code">
                 <div className="space-y-4 py-4">
                    <Label htmlFor="redeem-code-input">Enter your code</Label>
                    <Input
                        id="redeem-code-input"
                        value={redeemCodeInput}
                        onChange={(e) => setRedeemCodeInput(e.target.value)}
                        placeholder="e.g., WINNER123"
                    />
                    <p className="text-xs text-muted-foreground">Enter "WINNER123" to get 500 bonus coins!</p>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" onClick={resetState}>Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleRedeemCode} disabled={!redeemCodeInput || isRedeeming}>
                        {isRedeeming ? 'Validating...' : 'Redeem'}
                    </Button>
                </DialogFooter>
            </TabsContent>
        </Tabs>
    </>
  );

  const numAmount = parseFloat(amount) || 0;
  const gst = numAmount * GST_RATE;
  const platformFee = numAmount * PLATFORM_FEE_RATE;
  const totalDeductions = gst + platformFee;
  const finalAmount = numAmount - totalDeductions;

  const debitContent = (
    <>
      <DialogHeader>
        <DialogTitle>Redeem Coins</DialogTitle>
        <DialogDescription>
          Enter your UPI ID and the amount to redeem. 28% GST and 10% platform fees will be applied.
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
        {numAmount > 0 && (
            <div className="col-span-4 p-4 mt-2 space-y-2 text-sm border rounded-md bg-muted/50">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">GST (28%)</span>
                    <span className="font-medium">- {gst.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform Fee (10%)</span>
                    <span className="font-medium">- {platformFee.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                 <div className="flex justify-between font-bold border-t pt-2 mt-2">
                    <span>You Will Receive</span>
                    <span>{finalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
            </div>
        )}
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" onClick={resetState}>Cancel</Button>
        </DialogClose>
        <Button onClick={handleConfirm} disabled={numAmount <= 0 || !upiId}>Request Redemption</Button>
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
