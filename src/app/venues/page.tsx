'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TeamWithCountry } from '@/types/db/teams';
import { VenueRow } from '@/types';

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

// Icon components
const MapPinIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const UsersIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);

const HomeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

type VenueWithTeams = VenueRow & {
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
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
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
            <Link
              key={venue.id}
              href={`/venues/${venue.id}`}
              className="group block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:shadow-blue-100/50 hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Venue Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-4xl mb-2">🏟️</div>
                    <div className="text-sm font-medium opacity-90">Stadium</div>
                  </div>
                </div>
                {/* Capacity Badge */}
                {venue.capacity && (
                  <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-medium">
                    <UsersIcon className="w-3 h-3 inline mr-1" />
                    {venue.capacity.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Venue Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {venue.name}
                  </h3>
                  
                  {/* Home Team */}
                  {venue.teams.length > 0 && (
                    <div className="flex items-center space-x-2 mb-3">
                      <HomeIcon className="w-4 h-4 text-blue-500" />
                      <span className="text-blue-600 font-medium text-sm">
                        {venue.teams[0].name}
                      </span>
                      {venue.teams[0].country && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {venue.teams[0].country.name}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Address */}
                  {venue.address && (
                    <div className="flex items-start space-x-2">
                      <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-gray-600 text-sm line-clamp-2 flex-1">
                        {venue.address}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    {venue.surface && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        {venue.surface}
                      </span>
                    )}
                    {venue.teams.length > 1 && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                        +{venue.teams.length - 1} teams
                      </span>
                    )}
                  </div>
                  <div className="text-blue-500 group-hover:text-blue-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
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