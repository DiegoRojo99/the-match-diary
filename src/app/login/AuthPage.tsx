'use client';

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

export default function AuthPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) console.error('Login error:', error.message);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {user ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl mb-4">Welcome, {user.user_metadata.full_name}</h2>
          <img
            src={user.user_metadata.avatar_url}
            alt="User"
            className="w-16 h-16 rounded-full mx-auto mb-4"
          />
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl mb-4">Sign in with Google</h2>
          <button
            onClick={handleSignIn}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Sign In
          </button>
        </div>
      )}
    </div>
  );
};