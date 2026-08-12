'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, useAuth } from '@/lib/auth';
import FootballLoader from '@/components/FootballLoader';
import { UserMatchWithMatch } from '@/types/prisma/match';

type StadiumArchiveEntry = {
  venueId: number;
  venueName: string;
  city: string | null;
  imageUrl: string | null;
  visits: number;
  firstVisit: string;
  lastVisit: string;
  teams: string[];
  competitions: string[];
};

export default function MyStadiumsPage() {
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

        if (!response.ok) throw new Error('Failed to fetch visits');

        const data = await response.json();
        setVisits(data);
      } catch (error) {
        console.error('Error fetching stadium archive:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, [authLoading, router, user]);

  const archive = useMemo(() => groupVenueArchive(visits), [visits]);

  const totalVisits = archive.reduce((sum, venue) => sum + venue.visits, 0);
  const citiesCount = new Set(archive.map((venue) => venue.city).filter(Boolean)).size;

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05150f]">
        <FootballLoader size="xl" text="Loading your stadium archive..." />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#05150f] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-[28px] border border-sky-400/20 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),transparent_35%),linear-gradient(135deg,#081a12,#10243c_45%,#06140d)] p-6 shadow-[0_30px_80px_rgba(4,10,8,0.8)] md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-300/80">Archive</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">My stadiums</h1>
            </div>
            <div className="rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-200">
              {archive.length === 0 ? 'No stadiums saved yet' : `${archive.length} grounds logged`}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StatTile label="Total visits" value={String(totalVisits)} tone="sky" />
            <StatTile label="Stadiums" value={String(archive.length)} tone="emerald" />
            <StatTile label="Cities" value={String(citiesCount)} tone="amber" />
          </div>
        </div>

        {archive.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-white/5 px-6 py-20 text-center shadow-[0_24px_60px_rgba(4,10,8,0.8)]">
            <div className="mb-6 text-7xl">🏟️</div>
            <h3 className="text-2xl font-bold text-white">Your stadium archive is empty</h3>
            <p className="mx-auto mt-3 max-w-xl text-slate-400">
              Start saving matches and build a personal map of the grounds that became part of your football story.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/my-matches"
                className="inline-flex rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-black text-white transition hover:border-sky-400/40 hover:text-sky-300"
              >
                Back to my diary
              </Link>
              <Link
                href="/venues"
                className="inline-flex rounded-full bg-gradient-to-r from-sky-400 to-sky-500 px-6 py-3 text-sm font-black text-slate-950 shadow-[0_18px_40px_rgba(56,189,248,0.35)] transition hover:brightness-110"
              >
                Discover stadiums
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {archive.map((venue) => (
              <StadiumCard key={venue.venueId} venue={venue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StadiumCard({ venue }: { venue: StadiumArchiveEntry }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,20,0.96),rgba(8,17,14,0.9))] shadow-[0_18px_50px_rgba(4,8,7,0.45)] transition duration-300 hover:-translate-y-1 hover:border-sky-400/30 hover:shadow-[0_24px_60px_rgba(56,189,248,0.12)]">
      <div className="relative h-40 overflow-hidden border-b border-white/10 bg-[#0c1b19]">
        {venue.imageUrl ? (
          <img src={venue.imageUrl} alt={venue.venueName} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),transparent_35%),linear-gradient(135deg,#0c2030,#0f2b1d_45%,#06140d)] text-5xl">
            🏟️
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#06150f] via-[#06150f]/10 to-transparent" />

        <div className="absolute bottom-3 left-3 rounded-full border border-sky-400/20 bg-sky-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200">
          {venue.visits} {venue.visits === 1 ? 'visit' : 'visits'}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-black text-white">{venue.venueName}</h3>
            <p className="mt-2 text-sm text-slate-300">{venue.city || 'Unknown city'}</p>
          </div>
          <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
            {venue.competitions.length} comp
          </span>
        </div>

        <div className="mt-5 space-y-2 text-sm text-slate-300">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
            <span>First seen</span>
            <span className="font-semibold text-white">{formatDate(venue.firstVisit)}</span>
          </div>
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
            <span>Last seen</span>
            <span className="font-semibold text-white">{formatDate(venue.lastVisit)}</span>
          </div>
        </div>

        {venue.teams.length > 0 && (
          <div className="mt-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Teams here</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {venue.teams.slice(0, 3).map((team) => (
                <span key={team} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-slate-200">
                  {team}
                </span>
              ))}
              {venue.teams.length > 3 && (
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-slate-400">
                  +{venue.teams.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-2">
          <Link
            href={`/venues/${venue.venueId}`}
            className="flex-1 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-center text-sm font-semibold text-sky-200 transition hover:border-sky-300/60 hover:bg-sky-500/15"
          >
            View venue
          </Link>
          <Link
            href="/my-matches"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:border-emerald-400/40 hover:text-emerald-300"
          >
            Diary
          </Link>
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

function groupVenueArchive(visits: UserMatchWithMatch[]): StadiumArchiveEntry[] {
  const map = new Map<number, StadiumArchiveEntry>();

  for (const visit of visits) {
    const venue = visit.match?.venue;
    const venueId = venue?.id;

    if (!venueId || !venue?.name) continue;

    const attendedDate = new Date(visit.attendedDate);
    const existing = map.get(venueId) ?? {
      venueId,
      venueName: venue.name,
      city: venue.city ?? null,
      imageUrl: venue.imageUrl ?? null,
      visits: 0,
      firstVisit: attendedDate.toISOString(),
      lastVisit: attendedDate.toISOString(),
      teams: [],
      competitions: [],
    };

    existing.visits += 1;
    existing.firstVisit = new Date(Math.min(new Date(existing.firstVisit).getTime(), attendedDate.getTime())).toISOString();
    existing.lastVisit = new Date(Math.max(new Date(existing.lastVisit).getTime(), attendedDate.getTime())).toISOString();

    if (visit.match?.homeTeam?.name) {
      existing.teams = dedupe([...existing.teams, visit.match.homeTeam.name]);
    }

    if (visit.match?.awayTeam?.name) {
      existing.teams = dedupe([...existing.teams, visit.match.awayTeam.name]);
    }

    if (visit.match?.competition?.name) {
      existing.competitions = dedupe([...existing.competitions, visit.match.competition.name]);
    }

    map.set(venueId, existing);
  }

  return Array.from(map.values()).sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());
}

function dedupe(items: string[]) {
  return [...new Set(items.filter(Boolean))];
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
