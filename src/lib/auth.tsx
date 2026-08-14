'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient, User, AuthError } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: { username?: string; display_name?: string }) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getSiteOrigin = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    if (isLocal) return window.location.origin;
    return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || window.location.origin;
  }

  if (process.env.NODE_ENV === 'production') return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://the-match-diary.vercel.app';
  return 'http://localhost:3000';
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle OAuth callback tokens from URL fragments
    const handleAuthCallback = async () => {
      // Check if we're on a page with auth tokens in the hash
      if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          try {
            // Set the session with the tokens from OAuth
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (!error && data.session) {
              setUser(data.session.user);
              // Clean the URL hash
              window.history.replaceState(null, '', window.location.pathname);
              return;
            }
          } catch (error) {
            console.error('Error setting OAuth session:', error);
          }
        }
      }
      
      // Get initial session normally
      const { data: { session } } = await supabase.auth.getSession();  
      setUser(session?.user ?? null);
      setLoading(false);
    };

    handleAuthCallback();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    userData?: { username?: string; display_name?: string }
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signInWithGoogle = async () => {
    const redirectOrigin = getSiteOrigin();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${redirectOrigin}/auth/callback`,
      },
    });
    
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const redirectOrigin = getSiteOrigin();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${redirectOrigin}/auth/reset-password`,
    });
    
    return { error };
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { supabase };