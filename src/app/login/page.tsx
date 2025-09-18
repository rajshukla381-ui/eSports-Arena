
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Swords, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
        toast({
            variant: 'destructive',
            title: 'Email required',
            description: 'Please enter your email address.',
        })
        return;
    }
    const success = await signIn(email);
    if (success) {
      setIsEmailSent(true);
    }
  };

  useEffect(() => {
      if (error) {
          toast({
              variant: 'destructive',
              title: 'Authentication Error',
              description: error,
          });
      }
  }, [error, toast]);


  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
              <p>Loading...</p>
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
            <p className="text-muted-foreground">Sign in to join and create tournaments</p>
        </div>
        
        {isEmailSent ? (
            <div className="text-center p-4 bg-primary/10 border border-primary/20 rounded-md">
                <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-bold">Check your email</h2>
                <p className="text-muted-foreground mt-2">
                    A sign-in link has been sent to <strong>{email}</strong>. Click the link to log in.
                </p>
            </div>
        ) : (
            <div className="w-full space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <Button onClick={handleSignIn} size="lg" className="w-full" disabled={loading}>
                    Send Sign-in Link
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}
