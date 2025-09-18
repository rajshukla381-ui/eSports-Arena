

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Swords, User, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const ADMIN_SECRET_ANSWER = "Raj"; // The answer to the secret question

export default function RoleSelectionPage() {
  const router = useRouter();
  const { signInAsGuest, signInAsAdmin, error } = useAuth();
  const { toast } = useToast();
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [secretAnswer, setSecretAnswer] = useState('');

  const handleUserSelection = () => {
    signInAsGuest();
    if (!error) {
      router.push('/');
    }
  };

  const handleAdminSelection = () => {
    setIsAdminDialogOpen(true);
  };

  const handleAdminLogin = async () => {
    const isAdmin = await signInAsAdmin(secretAnswer);
    if (isAdmin) {
      toast({
        title: 'Admin Access Granted',
        description: 'Welcome, Admin!',
      });
      router.push('/');
      setIsAdminDialogOpen(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'The answer is incorrect.',
      });
    }
    setSecretAnswer('');
  };

  if (error) {
    return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <div className="flex flex-col items-center gap-6 p-8 rounded-lg shadow-glow-destructive bg-card border border-destructive w-full max-w-sm text-center">
            <AlertTriangle className="h-16 w-16 text-destructive" />
             <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
             <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
       </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="flex flex-col items-center gap-6 p-8 rounded-lg shadow-glow-primary bg-card border w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <Swords className="h-16 w-16 text-primary" />
          <h1 className="text-3xl font-bold text-glow-primary tracking-wider">
            eSports Arena
          </h1>
          <p className="text-muted-foreground">Are you a User or an Admin?</p>
        </div>

        <div className="w-full space-y-4">
          <Button size="lg" className="w-full" onClick={handleUserSelection}>
            <User className="mr-2" />
            I am a User
          </Button>
          <Button size="lg" variant="outline" className="w-full" onClick={handleAdminSelection}>
            <ShieldCheck className="mr-2" />
            I am an Admin
          </Button>
        </div>
      </div>

      <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Verification</DialogTitle>
            <DialogDescription>
              To access the admin panel, please answer the security question.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="secret-answer">Your Brother Professional?</Label>
            <Input
              id="secret-answer"
              value={secretAnswer}
              onChange={(e) => setSecretAnswer(e.target.value)}
              placeholder="Enter the answer"
              onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAdminLogin}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    