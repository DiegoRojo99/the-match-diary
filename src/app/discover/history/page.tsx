'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { DiscoverCompetitionSummary, DiscoverFixtureNormalized } from '@/types';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 25 }, (_, index) => CURRENT_YEAR - index);

type SearchState = {
  teamId: string;
  competitionId: string;
  season: string;
  from: string;
  to: string;
};

export default function DiscoverHistoryPage() {
  const [competitions, setCompetitions] = useState<DiscoverCompetitionSummary[]>([]);
  const [fixtures, setFixtures] = useState<DiscoverFixtureNormalized[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedCompetition, setSelectedCompetition] = useState('');
  const [selectedSeason, setSelectedSeason] = useState(String(CURRENT_YEAR));
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadCompetitions = async () => {
      try {
        const response = await fetch('/api/admin/competitions');
        if (!response.ok) return;
        const data = await response.json();
        const flat = (data ?? []).flatMap((group: { competitions: DiscoverCompetitionSummary[] }) => group.competitions ?? []);
        setCompetitions(flat);
      } catch (error) {
        console.error('Error loading competitions:', error);
      }
    };

    loadCompetitions();
  }, []);

  const searchState = useMemo<SearchState>(() => ({
    teamId: selectedTeam,
    competitionId: selectedCompetition,
    season: selectedSeason,
    from: fromDate,
    to: toDate,
  }), [selectedTeam, selectedCompetition, selectedSeason, fromDate, toDate]);

  const searchFixtures = async () => {
    setLoading(true);
    setSubmitted(true);

    try {
      const params = new URLSearchParams();

      if (searchState.teamId) params.set('teamId', searchState.teamId);
      if (searchState.competitionId) params.set('competitionId', searchState.competitionId);
      if (searchState.season) params.set('season', searchState.season);
      if (searchState.from) params.set('from', searchState.from);
      if (searchState.to) params.set('to', searchState.to);
      params.set('limit', '30');

      const response = await fetch(`/api/discover/history?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load historical fixtures');

      const data = await response.json();
      setFixtures(data.fixtures ?? []);
    } catch (error) {
      console.error('Error loading historic fixtures:', error);
      setFixtures([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05150f] text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-300/80 sm:text-[11px]">Historical search</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">Add older games</h1>
          </div>
          <Link href="/discover" className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/40 hover:text-emerald-300 sm:w-auto">
            Back to discover
          </Link>
        </div>

        <div className="mb-8 rounded-[28px] border border-emerald-400/20 bg-[linear-gradient(135deg,#081a12,#0b271d_45%,#06140d)] p-4 shadow-[0_30px_80px_rgba(4,10,8,0.8)] sm:p-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="flex min-w-0 flex-col gap-2 text-sm text-slate-300">
              <span>Team</span>
              <input
                value={selectedTeam}
                onChange={(event) => setSelectedTeam(event.target.value)}
                placeholder="Search team name"
                className="w-full min-w-0 rounded-2xl border border-white/10 bg-[#0b1a17] px-3 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400/50 focus:outline-none"
              />
            </label>

            <label className="flex min-w-0 flex-col gap-2 text-sm text-slate-300">
              <span>Competition</span>
              <select
                value={selectedCompetition}
                onChange={(event) => setSelectedCompetition(event.target.value)}
                className="w-full min-w-0 rounded-2xl border border-white/10 bg-[#0b1a17] px-3 py-3 text-sm text-white focus:border-emerald-400/50 focus:outline-none"
              >
                <option value="">All competitions</option>
                {competitions.map((competition) => (
                  <option key={competition.id} value={competition.id}>
                    {competition.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex min-w-0 flex-col gap-2 text-sm text-slate-300">
              <span>Season</span>
              <select
                value={selectedSeason}
                onChange={(event) => setSelectedSeason(event.target.value)}
                className="w-full min-w-0 rounded-2xl border border-white/10 bg-[#0b1a17] px-3 py-3 text-sm text-white focus:border-emerald-400/50 focus:outline-none"
              >
                <option value="">Any season</option>
                {YEARS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </label>

            <label className="flex min-w-0 flex-col gap-2 text-sm text-slate-300">
              <span>From</span>
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="w-full min-w-0 rounded-2xl border border-white/10 bg-[#0b1a17] px-3 py-3 text-sm text-white focus:border-emerald-400/50 focus:outline-none"
              />
            </label>

            <label className="flex min-w-0 flex-col gap-2 text-sm text-slate-300">
              <span>To</span>
              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="w-full min-w-0 rounded-2xl border border-white/10 bg-[#0b1a17] px-3 py-3 text-sm text-white focus:border-emerald-400/50 focus:outline-none"
              />
            </label>
          </div>

          <div className="mt-5 flex justify-center sm:justify-end">
            <button
              onClick={searchFixtures}
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 px-5 py-3 text-sm font-black text-[#052814] shadow-[0_18px_40px_rgba(16,185,129,0.35)] transition hover:brightness-110 disabled:opacity-60 sm:w-auto"
            >
              {loading ? 'Searching...' : 'Search fixtures'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-10 text-center text-slate-300">
            Loading historic fixtures...
          </div>
        ) : submitted && fixtures.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-white/10 bg-[#0b1a17] p-10 text-center text-slate-300">
            No matches found for this search. Try another team or date range.
          </div>
        ) : fixtures.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {fixtures.map((fixture) => (
              <div key={fixture.id} className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-[0_24px_60px_rgba(4,10,8,0.7)] sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-xs">
                    {fixture.competition.logoUrl && (
                      <Image
                        src={fixture.competition.logoUrl}
                        alt={fixture.competition.name ?? 'Competition logo'}
                        width={18}
                        height={18}
                        unoptimized
                        className="h-4 w-4 shrink-0 object-contain"
                      />
                    )}
                    <span className="truncate">{fixture.competition.name}</span>
                  </div>
                  <span className="shrink-0 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                    {fixture.status.short ?? 'TBD'}
                  </span>
                </div>

                <div className="flex flex-col gap-3 rounded-[22px] border border-white/5 bg-[#0b1a17] p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
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
                    <span className="max-w-full truncate text-sm font-bold text-white">{fixture.homeTeam.name}</span>
                  </div>

                  <div className="flex min-w-[72px] flex-col items-center text-center">
                    <div className="text-xl font-black tracking-[-0.06em] text-white sm:text-2xl">
                      {fixture.goals.home ?? '—'}
                      <span className="mx-2 text-slate-500">-</span>
                      {fixture.goals.away ?? '—'}
                    </div>
                    <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:text-[10px]">
                      {!!fixture.date && new Date(fixture.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                    <span className="max-w-full truncate text-sm font-bold text-white">{fixture.awayTeam.name}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 break-words text-sm text-slate-300">
                    {fixture.venue ? `${fixture.venue.name}${fixture.venue.city ? ` · ${fixture.venue.city}` : ''}` : 'Venue TBC'}
                  </div>
                  <div className="text-left text-slate-400 sm:text-right">
                    {!!fixture.date && new Date(fixture.date).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Link
                    href={`/matches/${fixture.id}`}
                    className="flex-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-center text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/15"
                  >
                    View match
                  </Link>
                  <Link
                    href={`/matches/${fixture.id}`}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-center text-sm font-semibold text-slate-200 transition hover:border-emerald-400/40 hover:text-emerald-300 sm:text-left"
                  >
                    Add to diary
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
