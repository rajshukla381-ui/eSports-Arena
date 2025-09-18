
'use client';

import { useRouter } from 'next/navigation';
import { auth, provider, signInWithPopup } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Swords } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
      toast({
        title: 'Signed In',
        description: 'You have successfully signed in.',
      });
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        variant: 'destructive',
        title: 'Sign In Failed',
        description: 'Could not sign you in with Google. Please try again.',
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="flex flex-col items-center gap-4 p-8 rounded-lg shadow-glow-primary bg-card border">
         <Swords className="h-16 w-16 text-primary" />
         <h1 className="text-3xl font-bold text-glow-primary tracking-wider">
            eSports Arena
         </h1>
        <p className="text-muted-foreground">Sign in to join and create tournaments</p>
        <Button onClick={handleSignIn} size="lg">
          Sign In with Google
        </Button>
      </div>
    </div>
  );
}
