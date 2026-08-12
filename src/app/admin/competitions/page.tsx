'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import FootballLoader from '@/components/FootballLoader';

interface Competition {
  id: number;
  api_id: number;
  name: string;
  type: string;
  visible: boolean;
  seeded: boolean;
}

interface CountryGroup {
  countryName: string;
  country: { name: string; code: string | null };
  competitions: Competition[];
}

export default function AdminCompetitions() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [competitions, setCompetitions] = useState<CountryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set(['World']));
  const [updating, setUpdating] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetchCompetitions();
  }, [user]);

  const fetchCompetitions = async () => {
    try {
      const response = await fetch('/api/admin/competitions');
      if (!response.ok) throw new Error('Failed to fetch competitions');
      const data = await response.json();
      setCompetitions(data);
    } catch (error) {
      console.error('Error fetching competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCompetitionVisibility = async (competitionId: number, currentVisible: boolean) => {
    setUpdating((prev) => new Set(prev).add(competitionId));

    try {
      const response = await fetch('/api/admin/competitions/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitionId, visible: !currentVisible }),
      });

      if (!response.ok) throw new Error('Failed to update competition');

      setCompetitions((prevCompetitions) =>
        prevCompetitions.map((countryGroup) => ({
          ...countryGroup,
          competitions: countryGroup.competitions.map((comp) =>
            comp.id === competitionId ? { ...comp, visible: !currentVisible } : comp,
          ),
        })),
      );
    } catch (error) {
      console.error('Error updating competition:', error);
      alert('Failed to update competition visibility');
    } finally {
      setUpdating((prev) => {
        const newSet = new Set(prev);
        newSet.delete(competitionId);
        return newSet;
      });
    }
  };

  const toggleCountryExpansion = (countryName: string) => {
    setExpandedCountries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(countryName)) {
        newSet.delete(countryName);
      } else {
        newSet.add(countryName);
      }
      return newSet;
    });
  };

  const filteredCompetitions = competitions
    .map((countryGroup) => ({
      ...countryGroup,
      competitions: countryGroup.competitions.filter((comp) => {
        const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesVisibility =
          visibilityFilter === 'all' ||
          (visibilityFilter === 'visible' && comp.visible) ||
          (visibilityFilter === 'hidden' && !comp.visible);
        return matchesSearch && matchesVisibility;
      }),
    }))
    .filter((countryGroup) => countryGroup.competitions.length > 0);

  const filteredTotalCompetitions = filteredCompetitions.reduce((sum, group) => sum + group.competitions.length, 0);
  const filteredVisibleCompetitions = filteredCompetitions.reduce((sum, group) => sum + group.competitions.filter((comp) => comp.visible).length, 0);
  const totalCompetitions = competitions.reduce((sum, group) => sum + group.competitions.length, 0);
  const visibleCompetitions = competitions.reduce((sum, group) => sum + group.competitions.filter((comp) => comp.visible).length, 0);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05150f]">
        <FootballLoader size="xl" text="Loading competitions..." />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#05150f] text-white">
      <div className="border-b border-white/10 bg-[#081a12]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-300/80">Admin</p>
              <h1 className="mt-2 text-3xl font-black md:text-4xl">Competition management</h1>
            </div>
            <button onClick={() => router.push('/')} className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/40 hover:text-emerald-300">
              ← Back home
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <OverviewCard label="Total competitions" value={(searchTerm || visibilityFilter !== 'all') ? `${filteredTotalCompetitions} / ${totalCompetitions}` : totalCompetitions} icon="🏆" accent="sky" />
          <OverviewCard label="Visible" value={(searchTerm || visibilityFilter !== 'all') ? `${filteredVisibleCompetitions} / ${visibleCompetitions}` : visibleCompetitions} icon="👁️" accent="emerald" />
          <OverviewCard label="Hidden" value={(searchTerm || visibilityFilter !== 'all') ? `${filteredTotalCompetitions - filteredVisibleCompetitions} / ${totalCompetitions - visibleCompetitions}` : totalCompetitions - visibleCompetitions} icon="🚫" accent="slate" />
        </div>

        <div className="mb-6 rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-[0_24px_60px_rgba(4,10,8,0.8)]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search competitions..."
            className="w-full rounded-2xl border border-white/10 bg-[#0b1d16] px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ['all', `All (${totalCompetitions})`],
              ['visible', `Visible (${visibleCompetitions})`],
              ['hidden', `Hidden (${totalCompetitions - visibleCompetitions})`],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setVisibilityFilter(value as 'all' | 'visible' | 'hidden')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  visibilityFilter === value
                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-[#052814]'
                    : 'border border-white/10 bg-white/5 text-slate-300 hover:border-emerald-400/40 hover:text-emerald-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {filteredCompetitions.map((countryGroup) => {
            const isExpanded = expandedCountries.has(countryGroup.countryName);
            const visibleCount = countryGroup.competitions.filter((comp) => comp.visible).length;

            return (
              <div key={countryGroup.countryName} className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_24px_60px_rgba(4,10,8,0.8)]">
                <button onClick={() => toggleCountryExpansion(countryGroup.countryName)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/5 md:px-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{countryGroup.countryName === 'World' ? '🌍' : '🏴'}</span>
                    <div>
                      <div className="text-lg font-bold text-white">
                        {countryGroup.countryName}
                        {countryGroup.country.code && ` (${countryGroup.country.code})`}
                      </div>
                      <div className="text-sm text-slate-400">{visibleCount}/{countryGroup.competitions.length} visible</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <span>{countryGroup.competitions.length} competitions</span>
                    <span className={`transition ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-white/10 px-4 py-4 md:px-6">
                    <div className="space-y-3">
                      {countryGroup.competitions.map((competition) => (
                        <div key={competition.id} className="flex flex-col gap-3 rounded-[22px] border border-white/10 bg-[#0b1d16] p-4 md:flex-row md:items-center md:justify-between">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${competition.type === 'League' ? 'bg-sky-500/10 text-sky-100' : 'bg-amber-500/10 text-amber-100'}`}>
                                {competition.type}
                              </span>
                              <span className="text-base font-bold text-white">{competition.name}</span>
                              <span className="text-xs text-slate-400">ID: {competition.api_id}</span>
                              <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${competition.seeded ? 'bg-emerald-500/10 text-emerald-200' : 'bg-slate-500/10 text-slate-200'}`}>
                                {competition.seeded ? 'Seeded' : 'Not seeded'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 md:justify-end">
                            <span className={`text-sm font-semibold ${competition.visible ? 'text-emerald-300' : 'text-slate-400'}`}>
                              {competition.visible ? 'Visible' : 'Hidden'}
                            </span>
                            <button
                              onClick={() => toggleCompetitionVisibility(competition.id, competition.visible)}
                              disabled={updating.has(competition.id)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${competition.visible ? 'bg-emerald-500' : 'bg-slate-600'} ${updating.has(competition.id) ? 'cursor-not-allowed opacity-60' : ''}`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${competition.visible ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredCompetitions.length === 0 && (
          <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 px-6 py-16 text-center shadow-[0_24px_60px_rgba(4,10,8,0.8)]">
            <div className="mb-4 text-6xl">🔍</div>
            <h3 className="text-2xl font-bold text-white">No competitions found</h3>
            <p className="mt-3 text-slate-400">
              {searchTerm ? `No ${visibilityFilter === 'all' ? '' : visibilityFilter + ' '}competitions match “${searchTerm}”.` : `No ${visibilityFilter} competitions found.`}
            </p>
            {(searchTerm || visibilityFilter !== 'all') && (
              <button onClick={() => { setSearchTerm(''); setVisibilityFilter('all'); }} className="mt-6 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 px-5 py-2.5 text-sm font-black text-[#052814]">
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function OverviewCard({ label, value, icon, accent }: { label: string; value: string | number; icon: string; accent: 'sky' | 'emerald' | 'slate' }) {
  const accentStyles = {
    sky: 'border-sky-400/30 bg-sky-500/10 text-sky-200',
    emerald: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
    slate: 'border-white/10 bg-white/5 text-slate-200',
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
