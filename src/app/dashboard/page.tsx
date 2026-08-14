'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, useAuth } from '@/lib/auth';
import FootballLoader from '@/components/FootballLoader';
import { UserMatchWithMatch } from '@/types/prisma/match';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [visits, setVisits] = useState<UserMatchWithMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (!user) return;

    const fetchVisits = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/matches', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch dashboard data');

        const data = await response.json();
        setVisits(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, [authLoading, router, user]);

  const metrics = useMemo(() => {
    const rated = visits.filter((visit) => typeof visit.rating === 'number');
    const averageRating = rated.reduce((sum, visit) => sum + (visit.rating ?? 0), 0) / Math.max(1, rated.length);
    const uniqueVenues = new Set(visits.filter((visit) => visit.match?.venue?.id != null).map((visit) => visit.match!.venue!.id)).size;
    const cityCounts = new Map<string, number>();
    const stadiumCounts = new Map<string, number>();

    for (const visit of visits) {
      const city = visit.match?.venue?.city;
      if (city) cityCounts.set(city, (cityCounts.get(city) ?? 0) + 1);

      const stadiumName = visit.match?.venue?.name;
      if (stadiumName) stadiumCounts.set(stadiumName, (stadiumCounts.get(stadiumName) ?? 0) + 1);
    }

    const topCities = [...cityCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
    const cityHistory = [...cityCounts.entries()].sort((a, b) => b[1] - a[1]);
    const topStadiums = [...stadiumCounts.entries()].map(([name, visits]) => ({ name, visits })).sort((a, b) => b.visits - a.visits).slice(0, 3);
    const noteHighlights = [...visits]
      .filter((visit) => visit.notes && visit.notes.trim().length > 0)
      .sort((a, b) => new Date(b.attendedDate).getTime() - new Date(a.attendedDate).getTime())
      .slice(0, 3)
      .map((visit) => ({
        id: visit.id,
        date: visit.attendedDate,
        matchLabel: `${visit.match?.homeTeam?.name ?? 'Home team'} vs ${visit.match?.awayTeam?.name ?? 'Away team'}`,
        text: visit.notes ?? '',
      }));

    return {
      averageRating,
      uniqueVenues,
      topCities,
      cityHistory,
      topStadiums,
      noteHighlights,
      bestRating: rated.length ? [...rated].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0] : null,
      recentVisits: [...visits].sort((a, b) => new Date(b.attendedDate).getTime() - new Date(a.attendedDate).getTime()).slice(0, 4),
    };
  }, [visits]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05150f]">
        <FootballLoader size="xl" text="Loading your dashboard..." />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#05150f] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-[28px] border border-emerald-400/20 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),transparent_35%),linear-gradient(135deg,#081a12,#0f2b1d_45%,#06140d)] p-6 shadow-[0_30px_80px_rgba(4,10,8,0.8)] md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-300/80">Dashboard</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Your football life</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/my-matches" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-400/40 hover:text-emerald-300">
                My diary
              </Link>
              <Link href="/my-stadiums" className="rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:border-sky-400/40 hover:text-sky-100">
                My stadiums
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile label="Matches logged" value={String(visits.length)} tone="emerald" />
            <StatTile label="Avg. rating" value={metrics.averageRating > 0 ? `${metrics.averageRating.toFixed(1)}/10` : '—'} tone="amber" />
            <StatTile label="Stadiums" value={String(metrics.uniqueVenues)} tone="sky" />
            <StatTile label="Cities" value={String(metrics.cityHistory.length)} tone="violet" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_rgba(4,10,8,0.8)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-white">Latest memories</h2>
              <Link href="/my-matches" className="text-sm font-semibold text-emerald-300 transition hover:text-emerald-200">
                Open archive →
              </Link>
            </div>

            <div className="space-y-4">
              {metrics.recentVisits.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-white/10 bg-[#0b1a17] p-6 text-center text-slate-300">
                  Your diary is empty. Start logging matches and build your football story.
                </div>
              ) : (
                metrics.recentVisits.map((visit) => (
                  <Link key={visit.id} href={`/matches/${visit.matchId}`} className="block rounded-[22px] border border-white/10 bg-[#0b1a17] p-4 transition hover:border-emerald-400/30 hover:bg-[#0d221d]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">{formatDate(visit.attendedDate)}</div>
                        <div className="mt-2 text-lg font-bold text-white">
                          {visit.match?.homeTeam?.name ?? 'Home team'} vs {visit.match?.awayTeam?.name ?? 'Away team'}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {typeof visit.rating === 'number' && (
                          <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">
                            {visit.rating}/10
                          </span>
                        )}
                        <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200">
                          {visit.match?.venue?.name ?? 'Venue'}
                        </span>
                      </div>
                    </div>

                    {visit.notes && <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-300">{visit.notes}</p>}
                  </Link>
                ))
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_rgba(4,10,8,0.8)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Best memory</p>
              {metrics.bestRating ? (
                <>
                  <div className="mt-4 text-4xl font-black tracking-[-0.06em] text-white">{metrics.bestRating.rating}/10</div>
                  <div className="mt-2 text-sm text-slate-300">
                    {metrics.bestRating.match?.homeTeam?.name ?? 'Home team'} vs {metrics.bestRating.match?.awayTeam?.name ?? 'Away team'}
                  </div>
                </>
              ) : (
                <div className="mt-4 text-sm text-slate-300">No ratings yet.</div>
              )}
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_rgba(4,10,8,0.8)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Top stadiums</p>
              <div className="mt-4 space-y-3">
                {metrics.topStadiums.length === 0 ? (
                  <div className="text-sm text-slate-300">No stadium history yet.</div>
                ) : (
                  metrics.topStadiums.map((stadium) => (
                    <div key={stadium.name} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0b1a17] px-3 py-2">
                      <span className="text-sm font-medium text-white">{stadium.name}</span>
                      <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200">
                        {stadium.visits}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_rgba(4,10,8,0.8)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Top cities</p>
              <div className="mt-4 space-y-3">
                {metrics.topCities.length === 0 ? (
                  <div className="text-sm text-slate-300">No city history yet.</div>
                ) : (
                  metrics.topCities.map(([city, count]) => (
                    <div key={city} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0b1a17] px-3 py-2">
                      <span className="text-sm font-medium text-white">{city}</span>
                      <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">
                        {count}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_rgba(4,10,8,0.8)]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-white">Travel ledger</h2>
              <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-200">
                {metrics.cityHistory.length} cities
              </span>
            </div>

            <div className="space-y-3">
              {metrics.cityHistory.length === 0 ? (
                <div className="text-sm text-slate-300">Your city history is still empty.</div>
              ) : (
                metrics.cityHistory.map(([city, count]) => (
                  <div key={city} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0b1a17] px-3 py-3">
                    <div>
                      <div className="text-base font-semibold text-white">{city}</div>
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Football visits</div>
                    </div>
                    <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-200">
                      {count}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_rgba(4,10,8,0.8)]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-white">Notes from the road</h2>
              <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200">
                {metrics.noteHighlights.length} notes
              </span>
            </div>

            <div className="space-y-4">
              {metrics.noteHighlights.length === 0 ? (
                <div className="text-sm text-slate-300">No notes yet. Add a few thoughts after matches to capture the atmosphere.</div>
              ) : (
                metrics.noteHighlights.map((note) => (
                  <div key={note.id} className="rounded-[22px] border border-white/10 bg-[#0b1a17] p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">{formatDate(note.date)}</div>
                      <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-sky-200">
                        Match
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white">{note.matchLabel}</div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{note.text}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value, tone }: { label: string; value: string; tone: 'emerald' | 'amber' | 'sky' | 'violet' }) {
  const toneStyles = {
    emerald: 'border-emerald-400/20 bg-emerald-500/5 text-emerald-200',
    amber: 'border-amber-400/20 bg-amber-500/5 text-amber-200',
    sky: 'border-sky-400/20 bg-sky-500/5 text-sky-200',
    violet: 'border-violet-400/20 bg-violet-500/5 text-violet-200',
  };

  return (
    <div className={`rounded-[22px] border p-4 backdrop-blur-sm ${toneStyles[tone]}`}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">{label}</div>
      <div className="mt-3 text-2xl font-black text-white">{value}</div>
    </div>
  );
}

function formatDate(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
