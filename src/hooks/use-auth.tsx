

'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile } from '@/lib/types';
import { getUser, createUser } from '@/lib/users';

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  signInAsGuest: () => Promise<void>;
  signInAsAdmin: (secret: string) => Promise<boolean>;
  signOut: () => void;
};

const AUTH_USER_KEY = 'authUser';
const ADMIN_EMAIL = 'rajshukla381@gmail.com';
const ADMIN_SECRET_ANSWER = "Raj";

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signInAsGuest: async () => {},
  signInAsAdmin: async () => false,
  signOut: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUserJSON = window.localStorage.getItem(AUTH_USER_KEY);
        if (storedUserJSON) {
          const storedUser: UserProfile = JSON.parse(storedUserJSON);
          const fullUser = await getUser(storedUser.email);

          if (fullUser?.isBlocked) {
            setError('Your account has been blocked by an administrator.');
            window.localStorage.removeItem(AUTH_USER_KEY);
            setUser(null);
          } else {
            setUser(fullUser);
          }
        }
      } catch (e) {
        console.error("Could not parse user from localStorage", e);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const signInAsGuest = async () => {
    const guestEmail = `guest_${Date.now()}`;
    let guestUser = await getUser(guestEmail);
    if (!guestUser) {
      guestUser = await createUser(guestEmail, 'guest');
    }
    
    if (guestUser.isBlocked) {
        setError('Your account has been blocked by an administrator.');
        setUser(null);
        return;
    }

    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(guestUser));
    setUser(guestUser);
  };

  const signInAsAdmin = async (secret: string) => {
    if (secret === ADMIN_SECRET_ANSWER) {
      let adminUser = await getUser(ADMIN_EMAIL);
      if (!adminUser) {
          adminUser = await createUser(ADMIN_EMAIL, 'admin');
      }
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
    <AuthContext.Provider value={{ user, loading, error, signInAsGuest, signInAsAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

    
