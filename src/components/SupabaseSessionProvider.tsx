"use client";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { createContext, useContext } from "react";
import supabase from "@/lib/supabase/client";

const AuthContext = createContext<Session | null>(null);

export function SupabaseSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
    };

    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={session}>{children}</AuthContext.Provider>;
}

export function useSupabaseSession() {
  return useContext(AuthContext);
}
