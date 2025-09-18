
'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type User = {
  email: string;
  role: 'guest' | 'admin';
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInAsGuest: () => void;
  signInAsAdmin: (secret: string) => boolean;
  signOut: () => void;
};

const AUTH_USER_KEY = 'authUser';
const ADMIN_EMAIL = 'rajshukla381@gmail.com';
const ADMIN_SECRET_ANSWER = "Raj";

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInAsGuest: () => {},
  signInAsAdmin: () => false,
  signOut: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = window.localStorage.getItem(AUTH_USER_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Could not parse user from localStorage", error);
    }
    setLoading(false);
  }, []);

  const signInAsGuest = () => {
    const guestUser: User = { email: `guest_${Date.now()}`, role: 'guest' };
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(guestUser));
    setUser(guestUser);
  };

  const signInAsAdmin = (secret: string) => {
    if (secret === ADMIN_SECRET_ANSWER) {
      const adminUser: User = { email: ADMIN_EMAIL, role: 'admin' };
      window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(adminUser));
      setUser(adminUser);
      return true;
    }
    return false;
  };

  const signOut = () => {
    window.localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInAsGuest, signInAsAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
