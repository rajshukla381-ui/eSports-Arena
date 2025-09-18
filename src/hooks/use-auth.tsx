
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  auth, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink,
  signInWithEmailLink,
  firebaseSignOut,
  actionCodeSettings
} from '@/lib/firebase';
import type { User as FirebaseAuthUser } from 'firebase/auth';

type User = {
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string) => Promise<boolean>;
  signOut: () => void;
  error: string | null;
};

const EMAIL_FOR_SIGN_IN_KEY = 'emailForSignIn';

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => false,
  signOut: () => {},
  error: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSignInWithEmailLink = useCallback(async () => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY);
      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }

      if (email) {
        try {
          const result = await signInWithEmailLink(auth, email, window.location.href);
          window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);
          if (result.user && result.user.email) {
            setUser({ email: result.user.email });
          }
        } catch (error: any) {
          setError(error.message);
          console.error("Sign in with email link failed:", error);
        }
      }
      // Clear the URL of the sign-in link query parameters
      router.replace(window.location.pathname);
    }
    setLoading(false);
  }, [router]);


  useEffect(() => {
    handleSignInWithEmailLink();
  }, [searchParams, handleSignInWithEmailLink]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser: FirebaseAuthUser | null) => {
      if (firebaseUser && firebaseUser.email) {
        setUser({ email: firebaseUser.email });
      } else {
        setUser(null);
      }
      
      // Only set loading to false if not in the middle of email link sign-in
      if (!isSignInWithEmailLink(auth, window.location.href)) {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, email);
      setLoading(false);
      return true;
    } catch (error: any) {
      console.error("Email link sending failed:", error);
      setError(error.message);
      setLoading(false);
      return false;
    }
  };

  const signOut = async () => {
    try {
        await firebaseSignOut(auth);
        setUser(null);
        router.push('/login');
    } catch (error) {
        console.error("Sign out failed:", error);
        setError((error as Error).message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
