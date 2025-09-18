
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Swords } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Email required',
        description: 'Please enter your email address.',
      });
      return;
    }
    signIn(email);
    toast({
      title: 'Signed In',
      description: `Welcome, ${email}`,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <form onSubmit={handleSignIn} className="flex flex-col items-center gap-6 p-8 rounded-lg shadow-glow-primary bg-card border w-full max-w-sm">
         <div className="flex flex-col items-center gap-2 text-center">
            <Swords className="h-16 w-16 text-primary" />
            <h1 className="text-3xl font-bold text-glow-primary tracking-wider">
                eSports Arena
            </h1>
            <p className="text-muted-foreground">Sign in to join and create tournaments</p>
        </div>
        <div className="w-full space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
        </div>
        <Button type="submit" size="lg" className="w-full">
          Sign In
        </Button>
      </form>
    </div>
  );
}
