'use client';

import { useState, useEffect } from 'react';
import TeamCard from './TeamCard';
import FootballLoader from '@/components/FootballLoader';
import { TeamWithVenue } from '@/lib/prisma';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamWithVenue[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'national' | 'club'>('all');
  const [hasSearched, setHasSearched] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchTeams = async () => {
      if (debouncedSearchTerm.trim().length < 2) {
        setTeams([]);
        setHasSearched(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      setHasSearched(true);

      try {
        const response = await fetch(`/api/teams?q=${encodeURIComponent(debouncedSearchTerm)}`);
        if (response.ok) {
          const data = await response.json();
          setTeams(data);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [debouncedSearchTerm]);

  const filteredTeams = teams.filter((team: TeamWithVenue) => {
    const matchesType =
      filterType === 'all' ||
      (filterType === 'national' && team.national) ||
      (filterType === 'club' && !team.national);

    return matchesType;
  });

  return (
    <div className="min-h-screen bg-[#05150f] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-[28px] border border-emerald-400/20 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),transparent_35%),linear-gradient(135deg,#081a12,#0e271d_45%,#06140d)] p-6 shadow-[0_30px_80px_rgba(4,10,8,0.8)] md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-300/80">Discover</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Teams</h1>
            </div>
            <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
              {hasSearched ? `${filteredTeams.length} found` : 'Explore the world of football'}
            </div>
          </div>

          <div className="mt-8 rounded-[24px] border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
            <div className="relative max-w-3xl mx-auto">
              <input
                type="text"
                placeholder="Search teams, codes, or countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#0b1d16] px-4 py-4 pl-12 text-base text-white placeholder:text-slate-500 focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                {loading ? <FootballLoader size="sm" text="" /> : <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
              </div>
            </div>

            {teams.length > 0 && (
              <div className="mt-5 flex justify-center">
                <div className="inline-flex gap-2 rounded-full border border-white/10 bg-white/5 p-1">
                  {[
                    ['all', 'All'],
                    ['club', 'Clubs'],
                    ['national', 'National'],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setFilterType(value as 'all' | 'club' | 'national')}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        filterType === value
                          ? 'bg-emerald-500 text-[#062217]'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {hasSearched && teams.length > 0 && (
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <StatCard label="Results" value={String(filteredTeams.length)} accent="emerald" icon="⚽" />
            <StatCard label="Clubs" value={String(filteredTeams.filter(team => !team.national).length)} accent="blue" icon="🏟️" />
            <StatCard label="National" value={String(filteredTeams.filter(team => team.national).length)} accent="amber" icon="🌍" />
          </div>
        )}

        {filteredTeams.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {filteredTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}

        {!hasSearched && !loading && (
          <div className="rounded-[28px] border border-white/10 bg-white/5 px-6 py-20 text-center shadow-[0_24px_60px_rgba(4,10,8,0.8)]">
            <div className="mb-6 text-7xl">🔎</div>
            <h3 className="text-2xl font-bold text-white">Search for football teams</h3>
            <p className="mx-auto mt-3 max-w-xl text-slate-400">
              Search by team name, code, or country to uncover clubs and national teams from around the world.
            </p>
            <p className="mt-5 text-sm text-slate-500">Try: Manchester, BAR, Spain</p>
          </div>
        )}

        {hasSearched && filteredTeams.length === 0 && !loading && (
          <div className="rounded-[28px] border border-white/10 bg-white/5 px-6 py-16 text-center shadow-[0_24px_60px_rgba(4,10,8,0.8)]">
            <div className="mb-5 text-6xl">😕</div>
            <h3 className="text-2xl font-bold text-white">No teams found</h3>
            <p className="mt-3 text-slate-400">
              {filterType !== 'all' ? 'Try another filter or search term.' : `No results for “${searchTerm}”.`}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}
              className="mt-6 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-bold text-[#052814] transition hover:bg-emerald-400"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent, icon }: { label: string; value: string; accent: 'emerald' | 'blue' | 'amber'; icon: string }) {
  const accentStyles = {
    emerald: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
    blue: 'border-sky-400/30 bg-sky-500/10 text-sky-200',
    amber: 'border-amber-400/30 bg-amber-500/10 text-amber-200',
  };

  return (
    <div className={`rounded-[24px] border p-5 ${accentStyles[accent]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-slate-300">{label}</p>
          <p className="mt-3 text-3xl font-black text-white">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}
