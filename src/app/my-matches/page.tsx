'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/auth';
import { UserMatchWithMatch } from '@/types/prisma/match';
import FootballLoader from '@/components/FootballLoader';
import VisitCard from './VisitCard';

export default function MyMatchesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [visits, setVisits] = useState<UserMatchWithMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchVisits = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      try {
        const responseData = await fetch('/api/user/matches', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }).then((res) => {
          if (!res.ok) throw new Error('Failed to fetch visits');
          return res.json();
        });

        setVisits(responseData);
      } catch (error) {
        console.error('Error fetching visits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, [user]);

  const handleDelete = async (visitId: string) => {
    setDeletingId(visitId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/user/matches/${visitId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.ok) setVisits((prev) => prev.filter((v) => v.id !== visitId));
    } catch (error) {
      console.error('Error deleting visit:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05150f]">
        <FootballLoader size="xl" text="Loading your matches..." />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#05150f] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-[28px] border border-emerald-400/20 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),transparent_35%),linear-gradient(135deg,#081a12,#0f2b1d_45%,#06140d)] p-6 shadow-[0_30px_80px_rgba(4,10,8,0.8)] md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-300/80">Journal</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">My Matches</h1>
            </div>
            <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
              {visits.length === 0 ? 'No matches logged yet' : `${visits.length} match${visits.length !== 1 ? 'es' : ''} saved`}
            </div>
          </div>
        </div>

        {visits.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-white/5 px-6 py-20 text-center shadow-[0_24px_60px_rgba(4,10,8,0.8)]">
            <div className="mb-6 text-7xl">⚽</div>
            <h3 className="text-2xl font-bold text-white">No matches logged yet</h3>
            <p className="mx-auto mt-3 max-w-xl text-slate-400">
              Start keeping your football memories. Browse fixtures and save the matches you’ve attended.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 px-6 py-3 text-sm font-black text-[#052814] shadow-[0_18px_40px_rgba(16,185,129,0.35)] transition hover:brightness-110"
            >
              Browse matches
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visits.map((visit) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                onDelete={handleDelete}
                deletingId={deletingId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

