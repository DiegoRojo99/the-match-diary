'use client';

import { useState, useEffect } from 'react';
import CompetitionCard from './CompetitionCard';
import FootballLoader from '@/components/FootballLoader';
import { CompetitionWithCountry } from '@/lib/prisma';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<CompetitionWithCountry[]>([]);
  const [countries, setCountries] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'League' | 'Cup'>('all');

  const debouncedSearch = useDebounce(searchTerm, 400);

  // Load all visible competitions on mount
  useEffect(() => {
    const loadAll = async () => {
      try {
        const res = await fetch('/api/competitions');
        if (res.ok) {
          const data: CompetitionWithCountry[] = await res.json();
          setCompetitions(data);
          // Build unique country list
          const seen = new Set<number>();
          const countriesList: { id: number; name: string }[] = [];
          for (const comp of data) {
            if (comp.country && !seen.has(comp.country.id)) {
              seen.add(comp.country.id);
              countriesList.push({ id: comp.country.id, name: comp.country.name });
            }
          }
          countriesList.sort((a, b) => a.name.localeCompare(b.name));
          setCountries(countriesList);
        }
      } catch (err) {
        console.error('Error fetching competitions:', err);
      } finally {
        setInitialLoading(false);
      }
    };
    loadAll();
  }, []);

  // Re-fetch when search / filters change
  useEffect(() => {
    const fetchFiltered = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch.trim().length >= 2) params.set('q', debouncedSearch.trim());
        if (filterCountry) params.set('country', filterCountry);
        if (filterType !== 'all') params.set('type', filterType);

        const res = await fetch(`/api/competitions?${params.toString()}`);
        if (res.ok) {
          const data: CompetitionWithCountry[] = await res.json();
          setCompetitions(data);
        }
      } catch (err) {
        console.error('Error fetching competitions:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!initialLoading) {
      fetchFiltered();
    }
  }, [debouncedSearch, filterCountry, filterType, initialLoading]);

  const leagues = competitions.filter((c) => c.type === 'League');
  const cups = competitions.filter((c) => c.type === 'Cup');

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCountry('');
    setFilterType('all');
  };

  const hasActiveFilters = searchTerm || filterCountry || filterType !== 'all';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Competitions
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Browse leagues and cups from around the world
          </p>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 space-y-4">
            {/* Search bar */}
            <div className="relative max-w-2xl">
              <input
                type="text"
                placeholder="Search competitions by name or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-4 pl-12 text-gray-700 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-lg"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                {loading ? (
                  <FootballLoader size="sm" text="" />
                ) : (
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                )}
              </div>
            </div>

            {/* Country filter */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Country:</label>
                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                >
                  <option value="">All Countries</option>
                  {countries.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type filter */}
              <div className="inline-flex bg-gray-100 rounded-lg p-1">
                {(['all', 'League', 'Cup'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      filterType === t
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t === 'all' ? 'All Types' : t}
                  </button>
                ))}
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        {competitions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Competitions</h3>
                  <p className="text-3xl font-bold text-purple-600">{competitions.length}</p>
                </div>
                <div className="text-4xl">🏆</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Leagues</h3>
                  <p className="text-3xl font-bold text-indigo-600">{leagues.length}</p>
                </div>
                <div className="text-4xl">📋</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Cups</h3>
                  <p className="text-3xl font-bold text-amber-600">{cups.length}</p>
                </div>
                <div className="text-4xl">🥇</div>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {initialLoading && (
          <div className="flex justify-center items-center py-20">
            <FootballLoader size="xl" text="Loading competitions..." />
          </div>
        )}

        {/* Grid */}
        {!initialLoading && competitions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {competitions.map((competition) => (
              <CompetitionCard key={competition.id} competition={competition} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!initialLoading && competitions.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No competitions found</h3>
            <p className="text-gray-500 mb-4">
              {hasActiveFilters
                ? 'Try adjusting your filters or search terms.'
                : 'No competitions are available yet.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
