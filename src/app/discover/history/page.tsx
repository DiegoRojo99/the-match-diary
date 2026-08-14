'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import FixtureCard from '@/components/FixtureCard';
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
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCompetition, setSelectedCompetition] = useState('');
  const [selectedSeason, setSelectedSeason] = useState(String(CURRENT_YEAR));
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const competitionGroups = useMemo(() => {
    const groups = new Map<string, DiscoverCompetitionSummary[]>();

    competitions.forEach((competition) => {
      const countryName = competition.country?.name ?? 'Other';
      const countryCompetitions = groups.get(countryName) ?? [];
      countryCompetitions.push(competition);
      groups.set(countryName, countryCompetitions);
    });

    return Array.from(groups.entries()).sort(([countryA], [countryB]) => countryA.localeCompare(countryB));
  }, [competitions]);

  const visibleCompetitions = useMemo(() => {
    if (selectedCountry === 'all') return competitions;
    return competitions.filter((competition) => (competition.country?.name ?? 'Other') === selectedCountry);
  }, [competitions, selectedCountry]);

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

        <div className="mb-8 rounded-[30px] border border-emerald-400/20 bg-[linear-gradient(135deg,#081a12,#0b271d_45%,#06140d)] p-4 shadow-[0_30px_80px_rgba(4,10,8,0.8)] sm:p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-300/80">Past games</p>
              <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">Search by team, competition and date</h2>
            </div>
            <div className="inline-flex items-center self-start rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300 sm:self-auto">
              {fixtures.length > 0 ? `${fixtures.length} results` : 'Ready'}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_1.2fr_1.2fr_0.8fr_0.8fr_auto]">
            <label className="flex min-w-0 flex-col gap-2 text-sm text-slate-300">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Team</span>
              <input
                value={selectedTeam}
                onChange={(event) => setSelectedTeam(event.target.value)}
                placeholder="Search team name"
                className="w-full min-w-0 rounded-2xl border border-white/10 bg-[#0b1a17] px-3 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400/50 focus:outline-none"
              />
            </label>

            <label className="flex min-w-0 flex-col gap-2 text-sm text-slate-300">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Country</span>
              <div className="relative">
                <select
                  value={selectedCountry}
                  onChange={(event) => {
                    setSelectedCountry(event.target.value);
                    setSelectedCompetition('');
                  }}
                  className="w-full min-w-0 appearance-none rounded-2xl border border-white/10 bg-[#0b1a17] px-3 py-3 pr-10 text-sm text-white focus:border-emerald-400/50 focus:outline-none"
                >
                  <option value="all">All countries</option>
                  {competitionGroups.map(([countryName]) => (
                    <option key={countryName} value={countryName}>
                      {countryName}
                    </option>
                  ))}
                </select>
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
                  <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </label>

            <label className="flex min-w-0 flex-col gap-2 text-sm text-slate-300">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Competition</span>
              <div className="relative">
                <select
                  value={selectedCompetition}
                  onChange={(event) => setSelectedCompetition(event.target.value)}
                  className="w-full min-w-0 appearance-none rounded-2xl border border-white/10 bg-[#0b1a17] px-3 py-3 pr-10 text-sm text-white focus:border-emerald-400/50 focus:outline-none"
                >
                  <option value="">All competitions</option>
                  {visibleCompetitions.map((competition) => (
                    <option key={competition.id} value={competition.id}>
                      {competition.name}
                    </option>
                  ))}
                </select>
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
                  <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </label>

            <label className="flex min-w-0 flex-col gap-2 text-sm text-slate-300">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Season</span>
              <div className="relative">
                <select
                  value={selectedSeason}
                  onChange={(event) => setSelectedSeason(event.target.value)}
                  className="w-full min-w-0 appearance-none rounded-2xl border border-white/10 bg-[#0b1a17] px-3 py-3 pr-10 text-sm text-white focus:border-emerald-400/50 focus:outline-none"
                >
                  <option value="">Any season</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
                  <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </label>

            <label className="flex min-w-0 flex-col gap-2 text-sm text-slate-300">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">From</span>
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="w-full min-w-0 rounded-2xl border border-white/10 bg-[#0b1a17] px-3 py-3 text-sm text-white focus:border-emerald-400/50 focus:outline-none"
              />
            </label>

            <label className="flex min-w-0 flex-col gap-2 text-sm text-slate-300">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">To</span>
              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="w-full min-w-0 rounded-2xl border border-white/10 bg-[#0b1a17] px-3 py-3 text-sm text-white focus:border-emerald-400/50 focus:outline-none"
              />
            </label>

            <div className="flex items-end">
              <button
                onClick={searchFixtures}
                disabled={loading}
                className="w-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 px-5 py-3 text-sm font-black text-[#052814] shadow-[0_18px_40px_rgba(16,185,129,0.35)] transition hover:brightness-110 disabled:opacity-60"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
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
              <FixtureCard key={fixture.id} fixture={fixture} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
