'use client';

import { useState, useEffect } from 'react';
import VenueCard from './VenueCard';
import FootballLoader from '@/components/FootballLoader';
import { Venue } from '@prisma/client';
import { TeamWithCountry } from '@/lib/prisma';

// Custom hook for debounced values
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
}

export default function VenuesPage() {
  const [venues, setVenues] = useState<VenueWithTeams[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce search term
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

  // No additional filtering needed since search is handled by API
  const filteredVenues = venues;



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Football Venues
          </h1>
          <p className="text-lg text-gray-600 mb-6">Discover amazing stadiums and venues from around the world</p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search for venues by name, address, city, or team... (minimum 2 characters)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-4 pl-12 text-gray-700 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                {loading ? (
                  <FootballLoader size="sm" text="" />
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats - only show when we have search results */}
        {hasSearched && venues.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Venues Found</h3>
                  <p className="text-3xl font-bold text-blue-600">{filteredVenues.length}</p>
                </div>
                <div className="text-4xl">🏟️</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Venues Grid - only show when we have results */}
        {filteredVenues.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        )}
        
        {/* Empty States */}
        {!hasSearched && !loading && (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <div className="text-8xl mb-6">🏟️</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Search for Football Venues
            </h3>
            <p className="text-lg text-gray-500 mb-6 max-w-md mx-auto">
              Find stadiums and venues by name, location, or the teams that play there.
            </p>
            <div className="text-sm text-gray-400">
              Try searching for: <span className="font-medium">"Camp Nou", "Wembley", "Manchester"</span>
            </div>
          </div>
        )}

        {hasSearched && filteredVenues.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No venues found
            </h3>
            <p className="text-gray-500 mb-4">
              No venues match "{searchTerm}". Try different search terms.
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}