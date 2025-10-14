'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { getAppUrl, getHomeUrl } from '../utils/urls';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, firstName?: string, lastName?: string, phone?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  isEmailVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // Using the imported supabase client directly

  // Check for existing session on mount
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setIsEmailVerified(session?.user?.email_confirmed_at ? true : false);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsEmailVerified(session?.user?.email_confirmed_at ? true : false);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string, phone?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Simple dev login - use "user" as email and "register" as password
      if (email === 'user' && password === 'register') {
        const mockUser: User = {
          id: 'demo-user-123',
          email: 'demo@accorria.com',
          email_confirmed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          app_metadata: {},
          aud: 'authenticated',
          user_metadata: {
            first_name: firstName || 'Demo',
            last_name: lastName || 'User',
            full_name: `${firstName || 'Demo'} ${lastName || 'User'}`.trim(),
            phone: phone || ''
          }
        };
        
          setUser(mockUser as User);
        setIsEmailVerified(true);
        setLoading(false);
        return { error: null };
      }

      // Sign up with Supabase
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            full_name: `${firstName || ''} ${lastName || ''}`.trim()
          },
          emailRedirectTo: getAppUrl()
        }
      });

      if (error) {
        setError(error.message);
        return { error };
      }

      // User will need to verify email before accessing dashboard
      return { error: null };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      return { error: { message: errorMessage } as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Simple dev login - use "user" as email and "register" as password
      if (email === 'user' && password === 'register') {
        const mockUser: User = {
          id: 'demo-user-123',
          email: 'demo@accorria.com',
          email_confirmed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          app_metadata: {},
          aud: 'authenticated',
          user_metadata: {
            first_name: 'Demo',
            last_name: 'User',
            full_name: 'Demo User'
          }
        };
        
          setUser(mockUser as User);
        setIsEmailVerified(true);
        setLoading(false);
        return { error: null };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error.message);
        return { error };
      }

      return { error: null };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      return { error: { message: errorMessage } as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsEmailVerified(false);
      setError(null);
      // Redirect to homepage after sign out
      if (typeof window !== 'undefined') {
        window.location.href = getHomeUrl();
      }
    } catch (error) {
      setError('Logout failed');
      console.error('Error signing out:', error);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    loading,
    error,
    clearError,
    isEmailVerified
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
