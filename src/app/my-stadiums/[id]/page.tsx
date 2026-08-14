'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth, supabase } from '@/lib/auth';
import FootballLoader from '@/components/FootballLoader';
import { UserMatchWithMatch } from '@/types/prisma/match';

type FallbackTeam = {
  name: string;
};

type FallbackVenue = {
  id: number;
  name: string;
  city?: string | null;
  country?: { name?: string | null } | null;
  imageUrl?: string | null;
  capacity?: number | null;
  surface?: string | null;
  teams?: FallbackTeam[];
};

type StadiumDetail = {
  id: number;
  name: string;
  city: string | null;
  country: string | null;
  imageUrl: string | null;
  capacity: number | null;
  surface: string | null;
  teams: string[];
  visits: UserMatchWithMatch[];
};

export default function MyStadiumDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();

  const [visits, setVisits] = useState<UserMatchWithMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [fallbackVenue, setFallbackVenue] = useState<FallbackVenue | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (!user || !params.id) return;

    const fetchUserMatches = async () => {
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

        if (!response.ok) throw new Error('Failed to fetch user matches');

        const data = await response.json();
        setVisits(data);
      } catch (error) {
        console.error('Error fetching visits for stadium detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserMatches();
  }, [authLoading, params.id, router, user]);

  useEffect(() => {
    if (!params.id) return;

    const fetchVenueFallback = async () => {
      try {
        const response = await fetch(`/api/venues/${params.id}`);
        if (!response.ok) return;
        const data = await response.json();
        setFallbackVenue(data);
      } catch (error) {
        console.error('Error fetching fallback venue:', error);
      }
    };

    fetchVenueFallback();
  }, [params.id]);

  const stadium = useMemo<StadiumDetail | null>(() => {
    const venueId = Number(params.id);
    if (Number.isNaN(venueId)) return null;

    const matchesForVenue = visits.filter((visit) => visit.match?.venue?.id === venueId);

    if (matchesForVenue.length === 0 && !fallbackVenue) return null;

    const baseVenue = matchesForVenue[0]?.match?.venue ?? fallbackVenue;
    if (!baseVenue) return null;

    const teams = matchesForVenue.reduce<string[]>((acc, visit) => {
      const homeName = visit.match?.homeTeam?.name;
      const awayName = visit.match?.awayTeam?.name;
      if (homeName && !acc.includes(homeName)) acc.push(homeName);
      if (awayName && !acc.includes(awayName)) acc.push(awayName);
      return acc;
    }, []);

    return {
      id: baseVenue.id,
      name: baseVenue.name,
      city: baseVenue.city ?? null,
      country: fallbackVenue?.country?.name ?? null,
      imageUrl: baseVenue.imageUrl ?? null,
      capacity: baseVenue.capacity ?? null,
      surface: baseVenue.surface ?? null,
      teams: teams.length ? teams : (fallbackVenue?.teams ?? []).map((team) => team.name),
      visits: matchesForVenue,
    };
  }, [fallbackVenue, params.id, visits]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05150f]">
        <FootballLoader size="xl" text="Loading stadium memory..." />
      </div>
    );
  }

  if (!user || !stadium) {
    return (
      <div className="min-h-screen bg-[#05150f] text-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <div className="mb-6 text-7xl">🏟️</div>
          <h3 className="text-3xl font-black text-white">Stadium not found</h3>
          <p className="mt-3 text-slate-400">This stadium is not in your archive yet.</p>
          <Link href="/my-stadiums" className="mt-8 inline-flex rounded-full bg-gradient-to-r from-sky-400 to-sky-500 px-6 py-3 text-sm font-black text-slate-950 shadow-[0_18px_40px_rgba(56,189,248,0.35)]">
            Back to my stadiums
          </Link>
        </div>
      </div>
    );
  }

  const avgRating =
    stadium.visits.filter((visit) => typeof visit.rating === 'number').reduce((sum, visit) => sum + (visit.rating ?? 0), 0) /
    Math.max(1, stadium.visits.filter((visit) => typeof visit.rating === 'number').length);

  return (
    <div className="min-h-screen bg-[#05150f] text-white">
      <div className="relative h-[58vh] min-h-[420px] w-full overflow-hidden">
        {stadium.imageUrl ? (
          <Image src={stadium.imageUrl} alt={stadium.name} fill className="object-cover" priority />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.24),transparent_35%),linear-gradient(135deg,#0a1d2d,#0d2d3f_45%,#06150f)]">
            <div className="text-center">
              <div className="text-7xl">🏟️</div>
              <div className="mt-4 text-xs font-bold uppercase tracking-[0.4em] text-sky-200">Stadium</div>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#05150f] via-[#05150f]/30 to-transparent" />

        <div className="absolute left-6 top-6 z-10">
          <Link href="/my-stadiums" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-sky-400/50 hover:bg-white/20">
            ← Back to stadiums
          </Link>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-300/80">Memory archive</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">{stadium.name}</h1>
            {stadium.city && <p className="mt-3 text-lg text-slate-200">{stadium.city}</p>}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatTile label="Visits" value={String(stadium.visits.length)} tone="sky" />
          <StatTile label="Avg. rating" value={stadium.visits.some((visit) => typeof visit.rating === 'number') ? `${avgRating.toFixed(1)}/10` : '—'} tone="amber" />
          <StatTile label="Teams seen" value={String(stadium.teams.length)} tone="emerald" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_rgba(4,10,8,0.8)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-white">Your visits</h2>
              <Link href="/my-matches" className="text-sm font-semibold text-sky-300 transition hover:text-sky-200">
                Open diary →
              </Link>
            </div>

            <div className="space-y-4">
              {stadium.visits.map((visit) => {
                const match = visit.match;
                const homeTeam = match?.homeTeam?.name ?? 'Home team';
                const awayTeam = match?.awayTeam?.name ?? 'Away team';
                const result = match && match.homeScore !== null && match.awayScore !== null ? `${match.homeScore}-${match.awayScore}` : 'Fixture';

                return (
                  <div key={visit.id} className="rounded-[22px] border border-white/10 bg-[#0b1a17] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">{formatDate(visit.attendedDate)}</div>
                        <div className="mt-2 text-lg font-bold text-white">
                          {homeTeam} vs {awayTeam}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-200">
                          {result}
                        </span>
                        {typeof visit.rating === 'number' && (
                          <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-200">
                            {visit.rating}/10
                          </span>
                        )}
                      </div>
                    </div>

                    {visit.notes && <p className="mt-3 text-sm leading-6 text-slate-300">{visit.notes}</p>}

                    <div className="mt-4 flex justify-end">
                      <Link href={`/matches/${visit.matchId}`} className="text-sm font-semibold text-emerald-300 transition hover:text-emerald-200">
                        View match →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_rgba(4,10,8,0.8)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Overview</p>
              <div className="mt-4 space-y-4 text-sm text-slate-300">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <span>City</span>
                  <span className="font-semibold text-white">{stadium.city || 'Unknown'}</span>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <span>Country</span>
                  <span className="font-semibold text-white">{stadium.country || 'Unknown'}</span>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <span>Capacity</span>
                  <span className="font-semibold text-white">{stadium.capacity?.toLocaleString() ?? 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Surface</span>
                  <span className="font-semibold text-white">{stadium.surface || 'Unknown'}</span>
                </div>
              </div>
            </div>

            {stadium.teams.length > 0 && (
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_rgba(4,10,8,0.8)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Teams</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {stadium.teams.map((team) => (
                    <span key={team} className="rounded-full border border-white/10 bg-[#0b1a17] px-3 py-1.5 text-xs font-medium text-slate-200">
                      {team}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value, tone }: { label: string; value: string; tone: 'sky' | 'emerald' | 'amber' }) {
  const toneStyles = {
    sky: 'border-sky-400/20 bg-sky-500/5 text-sky-200',
    emerald: 'border-emerald-400/20 bg-emerald-500/5 text-emerald-200',
    amber: 'border-amber-400/20 bg-amber-500/5 text-amber-200',
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
