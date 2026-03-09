'use client';

import { useState, useEffect } from 'react';
import { TeamWithCountry, VenueRow } from '@/types';
import TeamCard from './TeamCard';
import FootballLoader from '@/components/FootballLoader';

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

type TeamWithVenue = TeamWithCountry & {
  home_venue: VenueRow | null;
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamWithVenue[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'national' | 'club'>('all');
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce search term
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

  // Filter teams based on team type only (search is handled by API)
  const filteredTeams = teams.filter((team: TeamWithVenue) => {
    const matchesType = 
      filterType === 'all' || 
      (filterType === 'national' && team.national) ||
      (filterType === 'club' && !team.national);
    
    return matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Football Teams
          </h1>
          <p className="text-lg text-gray-600 mb-6">Explore teams from around the world</p>
          
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative max-w-2xl mx-auto">
                <input
                  type="text"
                  placeholder="Search for teams by name, code, or country... (minimum 2 characters)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-4 pl-12 text-gray-700 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-lg"
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

            {/* Team Type Filter - Only show if we have results */}
            {teams.length > 0 && (
              <div className="flex justify-center">
                <div className="inline-flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      filterType === 'all' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All Teams
                  </button>
                  <button
                    onClick={() => setFilterType('club')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      filterType === 'club' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Club Teams
                  </button>
                  <button
                    onClick={() => setFilterType('national')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      filterType === 'national' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    National Teams
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats - only show when we have search results */}
        {hasSearched && teams.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Results Found</h3>
                  <p className="text-3xl font-bold text-green-600">{filteredTeams.length}</p>
                </div>
                <div className="text-4xl">⚽</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Club Teams</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {filteredTeams.filter(team => !team.national).length}
                  </p>
                </div>
                <div className="text-4xl">🏟️</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">National Teams</h3>
                  <p className="text-3xl font-bold text-yellow-600">
                    {filteredTeams.filter(team => team.national).length}
                  </p>
                </div>
                <div className="text-4xl">🌍</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Teams Grid - only show when we have results */}
        {filteredTeams.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
        
        {/* Empty States */}
        {!hasSearched && !loading && (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Search for Football Teams
            </h3>
            <p className="text-lg text-gray-500 mb-6 max-w-md mx-auto">
              Enter a team name, code, or country to discover teams from around the world.
            </p>
            <div className="text-sm text-gray-400">
              Try searching for: <span className="font-medium">"Manchester", "BAR", "Spain"</span>
            </div>
          </div>
        )}

        {hasSearched && filteredTeams.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No teams found
            </h3>
            <p className="text-gray-500 mb-4">
              {filterType !== 'all' 
                ? `Try adjusting your filter or search for different terms.` 
                : `No teams match "${searchTerm}". Try different search terms.`}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}