
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Swords } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);


  const handleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    await signIn();
  };

  if (loading || user) {
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
        
        <Button onClick={handleSignIn} size="lg" className="w-full">
          Sign In with Google
        </Button>
      </div>
    </div>
  );
}
