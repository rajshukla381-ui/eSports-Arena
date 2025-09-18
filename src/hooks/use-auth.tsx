
'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

type User = {
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: () => {},
  signOut: () => {},
});

const AUTH_STORAGE_KEY = 'user_email';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedEmail = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedEmail) {
        setUser({ email: storedEmail });
      }
    } catch (error) {
      // localStorage is not available
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = (email: string) => {
    setUser({ email });
    localStorage.setItem(AUTH_STORAGE_KEY, email);
    router.push('/');
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
