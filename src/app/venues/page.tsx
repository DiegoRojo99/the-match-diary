'use client';

import { useState, useEffect } from 'react';
import VenueCard from './VenueCard';
import FootballLoader from '@/components/FootballLoader';
import { Venue } from '@prisma/client';
import { TeamWithCountry } from '@/lib/prisma';

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

type VenueWithTeams = Venue & {
  teams: TeamWithCountry[];
};

export default function VenuesPage() {
  const [venues, setVenues] = useState<VenueWithTeams[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchVenues = async () => {
      if (debouncedSearchTerm.trim().length < 2) {
        setVenues([]);
        setHasSearched(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      setHasSearched(true);

      try {
        const response = await fetch(`/api/venues?q=${encodeURIComponent(debouncedSearchTerm)}`);
        if (response.ok) {
          const data = await response.json();
          setVenues(data);
        }
      } catch (error) {
        console.error('Error fetching venues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, [debouncedSearchTerm]);

  const filteredVenues = venues;

  return (
    <div className="min-h-screen bg-[#071b13] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-[28px] border border-sky-400/20 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),transparent_35%),linear-gradient(135deg,#081a12,#11263e_45%,#06140d)] p-6 shadow-[0_30px_80px_rgba(4,10,8,0.8)] md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-300/80">Explore</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Venues</h1>
            </div>
            <div className="rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-200">
              {hasSearched ? `${filteredVenues.length} found` : 'Find the world’s stadiums'}
            </div>
          </div>

          <div className="mt-8 rounded-[24px] border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
            <div className="relative mx-auto max-w-3xl">
              <input
                type="text"
                placeholder="Search venues, cities, or teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#0b1320] px-4 py-4 pl-12 text-base text-white placeholder:text-slate-500 focus:border-sky-400/60 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                {loading ? <FootballLoader size="sm" text="" /> : <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
              </div>
            </div>
          </div>
        </div>

        {hasSearched && venues.length > 0 && (
          <div className="mb-8 rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_60px_rgba(4,10,8,0.8)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">Results</p>
                <p className="mt-2 text-3xl font-black text-white">{filteredVenues.length}</p>
              </div>
              <div className="text-4xl">🏟️</div>
            </div>
          </div>
        )}

        {filteredVenues.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {filteredVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        )}

        {!hasSearched && !loading && (
          <div className="rounded-[28px] border border-white/10 bg-white/5 px-6 py-20 text-center shadow-[0_24px_60px_rgba(4,10,8,0.8)]">
            <div className="mb-6 text-7xl">🏟️</div>
            <h3 className="text-2xl font-bold text-white">Search for football venues</h3>
            <p className="mx-auto mt-3 max-w-xl text-slate-400">
              Search by stadium name, city, address, or even the teams that call it home.
            </p>
            <p className="mt-5 text-sm text-slate-500">Try: Camp Nou, Wembley, Manchester</p>
          </div>
        )}

        {hasSearched && filteredVenues.length === 0 && !loading && (
          <div className="rounded-[28px] border border-white/10 bg-white/5 px-6 py-16 text-center shadow-[0_24px_60px_rgba(4,10,8,0.8)]">
            <div className="mb-5 text-6xl">😕</div>
            <h3 className="text-2xl font-bold text-white">No venues found</h3>
            <p className="mt-3 text-slate-400">No matches for “{searchTerm}”. Try a different search.</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-6 rounded-full bg-sky-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-sky-400"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
