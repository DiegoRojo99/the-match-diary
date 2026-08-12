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

  const ratedVisits = visits.filter((visit) => typeof visit.rating === 'number');
  const averageRating = ratedVisits.reduce((sum, visit) => sum + (visit.rating ?? 0), 0) / Math.max(1, ratedVisits.length);
  const uniqueVenues = new Set(visits.filter((visit) => visit.match?.venue?.id != null).map((visit) => visit.match!.venue!.id)).size;
  const uniqueCountries = new Set(visits.filter((visit) => visit.match?.venue?.city).map((visit) => visit.match!.venue!.city)).size;

  const mostRecentVisit = [...visits].sort(
    (a, b) => new Date(b.attendedDate).getTime() - new Date(a.attendedDate).getTime(),
  )[0];

  const highestRatedVisit = [...ratedVisits].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0];

  const archiveHighlights = [
    {
      label: 'Last match',
      value: mostRecentVisit ? formatShortDate(mostRecentVisit.attendedDate) : '—',
      caption: mostRecentVisit ? `${mostRecentVisit.match?.homeTeam?.name ?? 'Home'} vs ${mostRecentVisit.match?.awayTeam?.name ?? 'Away'}` : 'No entries yet',
    },
    {
      label: 'Best rated',
      value: highestRatedVisit ? `${highestRatedVisit.rating}/10` : '—',
      caption: highestRatedVisit ? `${highestRatedVisit.match?.competition?.name ?? 'Match'} memory` : 'No ratings yet',
    },
    {
      label: 'Cities seen',
      value: String(uniqueCountries),
      caption: 'Across your football travels',
    },
  ];

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05150f]">
        <FootballLoader size="xl" text="Loading your football diary..." />
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-300/80">My diary</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Football memories</h1>
            </div>
            <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
              {visits.length === 0 ? 'No matches logged yet' : `${visits.length} match${visits.length !== 1 ? 'es' : ''} saved`}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StatTile label="Matches logged" value={String(visits.length)} tone="emerald" />
            <StatTile label="Avg. rating" value={ratedVisits.length ? `${averageRating.toFixed(1)}/10` : '—'} tone="amber" />
            <StatTile label="Venues visited" value={String(uniqueVenues)} tone="sky" />
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {archiveHighlights.map((highlight) => (
            <div
              key={highlight.label}
              className="rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-[0_14px_40px_rgba(3,9,8,0.28)]"
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">{highlight.label}</div>
              <div className="mt-3 text-2xl font-black tracking-[-0.05em] text-white">{highlight.value}</div>
              <div className="mt-2 text-sm text-slate-300">{highlight.caption}</div>
            </div>
          ))}
        </div>

        {visits.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-white/5 px-6 py-20 text-center shadow-[0_24px_60px_rgba(4,10,8,0.8)]">
            <div className="mb-6 text-7xl">⚽</div>
            <h3 className="text-2xl font-bold text-white">Your football diary is empty right now</h3>
            <p className="mx-auto mt-3 max-w-xl text-slate-400">
              Start building your archive by saving the matches you have attended, the cities you have travelled for, and the memories that made the day special.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/venues"
                className="inline-flex rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-black text-white transition hover:border-emerald-400/40 hover:text-emerald-300"
              >
                Discover stadiums
              </Link>
              <Link
                href="/"
                className="inline-flex rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 px-6 py-3 text-sm font-black text-[#052814] shadow-[0_18px_40px_rgba(16,185,129,0.35)] transition hover:brightness-110"
              >
                Browse fixtures
              </Link>
            </div>
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

function StatTile({ label, value, tone }: { label: string; value: string; tone: 'emerald' | 'amber' | 'sky' }) {
  const toneStyles = {
    emerald: 'border-emerald-400/20 bg-emerald-500/5 text-emerald-200',
    amber: 'border-amber-400/20 bg-amber-500/5 text-amber-200',
    sky: 'border-sky-400/20 bg-sky-500/5 text-sky-200',
  };

  return (
    <div className={`rounded-[22px] border p-4 backdrop-blur-sm ${toneStyles[tone]}`}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">{label}</div>
      <div className="mt-3 text-2xl font-black text-white">{value}</div>
    </div>
  );
}

function formatShortDate(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

