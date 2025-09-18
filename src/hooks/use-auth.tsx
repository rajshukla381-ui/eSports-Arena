
'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, provider, signInWithPopup, signOut as firebaseSignOut } from '@/lib/firebase';
import type { User as FirebaseAuthUser } from 'firebase/auth';

type User = {
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: () => {},
  signOut: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser: FirebaseAuthUser | null) => {
      if (firebaseUser && firebaseUser.email) {
        setUser({ email: firebaseUser.email });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      if (result.user && result.user.email) {
        setUser({ email: result.user.email });
        router.push('/');
      }
    } catch (error) {
      console.error("Authentication failed:", error);
    } finally {
        setLoading(false);
    }
  };

  const signOut = async () => {
    try {
        await firebaseSignOut(auth);
        setUser(null);
        router.push('/login');
    } catch (error) {
        console.error("Sign out failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
