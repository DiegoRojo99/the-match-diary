'use client';

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useSupabaseSession } from '@/components/SupabaseSessionProvider';
import Image from 'next/image';

export default function AuthPage() {
  const session = useSupabaseSession();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (session) {
      setUser(session.user);
    } 
    else {
      setUser(null);
    }
  }, [session]);

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      }
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
          <h2 className="text-xl text-black mb-4">Welcome, {user.user_metadata.full_name}</h2>
          <Image
            src={user.user_metadata.avatar_url}
            alt="User"
            width={64}
            height={64}
            className="w-16 h-16 rounded-full mx-auto mb-4"
          />
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl text-black mb-4">Sign in with Google</h2>
          <button
            onClick={handleSignIn}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer"
          >
            Sign In
          </button>
        </div>
      )}
    </div>
  );
};