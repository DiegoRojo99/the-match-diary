'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { DiscoverCompetitionSummary, DiscoverFixtureNormalized } from '@/types';

export default function DiscoverPage() {
  const [competitions, setCompetitions] = useState<DiscoverCompetitionSummary[]>([]);
  const [fixtures, setFixtures] = useState<DiscoverFixtureNormalized[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);

  const fetchFixtures = async (competitionId?: number | 'all') => {
    setLoading(true);

    try {
      const params = new URLSearchParams({ limit: '12' });
      if (competitionId && competitionId !== 'all') {
        params.set('competitionId', String(competitionId));
      }

      const response = await fetch(`/api/discover/fixtures?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load fixtures');

      const data = await response.json();
      setCompetitions(data.competitions ?? []);
      setFixtures(data.fixtures ?? []);
    } catch (error) {
      console.error('Error loading fixtures:', error);
      setFixtures([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFixtures(selectedCompetition);
  }, [selectedCompetition]);

  const filteredFixtures = useMemo(() => {
    if (selectedCompetition === 'all') return fixtures;
    return fixtures.filter((fixture) => fixture.competition.id === selectedCompetition);
  }, [fixtures, selectedCompetition]);

  return (
    <div className="min-h-screen bg-[#05150f] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-[28px] border border-emerald-400/20 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),transparent_35%),linear-gradient(135deg,#081a12,#0e271d_45%,#06140d)] p-4 shadow-[0_30px_80px_rgba(4,10,8,0.8)] sm:p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-300/80">Discover</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">Find games to add</h1>
            </div>
            <div className="inline-flex w-fit items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
              Upcoming fixtures
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-md">
              <label htmlFor="competition-filter" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Competition
              </label>
              <select
                id="competition-filter"
                value={selectedCompetition === 'all' ? 'all' : selectedCompetition}
                onChange={(event) => setSelectedCompetition(event.target.value === 'all' ? 'all' : Number(event.target.value))}
                className="w-full appearance-none rounded-full border border-white/10 bg-[#0b1a17] px-4 py-2.5 pr-10 text-sm font-semibold text-white outline-none transition focus:border-emerald-400/50"
              >
                <option value="all">All competitions</option>
                {competitions.map((competition) => (
                  <option key={competition.id} value={competition.id}>
                    {competition.name}
                  </option>
                ))}
              </select>
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="pointer-events-none absolute right-4 top-[62%] h-4 w-4 -translate-y-1/2 text-slate-400">
                <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <Link
              href="/discover/history"
              className="inline-flex items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/15 sm:min-w-[180px]"
            >
              Search past games
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-10 text-center text-slate-300">
            Loading matches...
          </div>
        ) : filteredFixtures.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-white/10 bg-[#0b1a17] p-10 text-center text-slate-300">
            No upcoming fixtures match this filter right now.
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredFixtures.map((fixture) => (
              <div key={fixture.id} className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_60px_rgba(4,10,8,0.7)]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {fixture.competition.logoUrl && (
                      <Image
                        src={fixture.competition.logoUrl}
                        alt={fixture.competition.name ?? 'Competition logo'}
                        width={18}
                        height={18}
                        unoptimized
                        className="h-4 w-4 object-contain"
                      />
                    )}
                    <span>{fixture.competition.name}</span>
                  </div>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                    {fixture.status.short ?? 'TBD'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-[22px] border border-white/5 bg-[#0b1a17] p-4">
                  <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                    {fixture.homeTeam.logoUrl && (
                      <Image
                        src={fixture.homeTeam.logoUrl}
                        alt={fixture.homeTeam.name ?? 'Home team logo'}
                        width={40}
                        height={40}
                        unoptimized
                        className="mb-2 h-10 w-10 object-contain"
                      />
                    )}
                    <span className="truncate text-sm font-bold text-white">{fixture.homeTeam.name}</span>
                  </div>

                  <div className="flex min-w-[72px] flex-col items-center text-center">
                    <div className="text-2xl font-black tracking-[-0.06em] text-white">
                      {fixture.goals.home ?? '—'}
                      <span className="mx-2 text-slate-500">-</span>
                      {fixture.goals.away ?? '—'}
                    </div>
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      {!!fixture.date && new Date(fixture.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                    {fixture.awayTeam.logoUrl && (
                      <Image
                        src={fixture.awayTeam.logoUrl}
                        alt={fixture.awayTeam.name ?? 'Away team logo'}
                        width={40}
                        height={40}
                        unoptimized
                        className="mb-2 h-10 w-10 object-contain"
                      />
                    )}
                    <span className="truncate text-sm font-bold text-white">{fixture.awayTeam.name}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    {fixture.venue ? `${fixture.venue.name}${fixture.venue.city ? ` · ${fixture.venue.city}` : ''}` : 'Venue TBC'}
                  </div>
                  <div className="text-right text-slate-400">
                    {!!fixture.date && new Date(fixture.date).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/matches/${fixture.id}`}
                    className="flex-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-center text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/15"
                  >
                    View match
                  </Link>
                  <Link
                    href={`/matches/${fixture.id}`}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/40 hover:text-emerald-300"
                  >
                    Add to diary
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
