import { useState, useEffect } from 'react';
import { TeamWithCountry, VenueRow } from '@/types';
import MatchCard from './MatchCard';
import { MatchWithDetails } from '@/types/prisma/match';

type TeamWithVenue = TeamWithCountry & {
  home_venue: VenueRow | null;
};

interface TeamMatchesProps {
  team: TeamWithVenue;
}

interface MatchesResponse {
  matches: MatchWithDetails[];
  team: {
    id: number;
    name: string;
  };
}

export default function TeamMatches({ team }: TeamMatchesProps) {
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedSeason, setSelectedSeason] = useState(2025);
  const [matchType, setMatchType] = useState<'finished' | 'upcoming'>('finished');
  
  // Track how many matches we want to fetch
  const [matchCount, setMatchCount] = useState(10);
  const INCREMENT_AMOUNT = 10;

  // Fetch matches with current filters
  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `/api/teams/${team.id}/matches?season=${selectedSeason}`;
      
      if (matchType === 'finished') url += `&last=${matchCount}`;
      else url += `&next=${matchCount}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch matches');
      
      const data: MatchesResponse = await response.json();
      
      // Sort matches by date based on match type
      const sortedMatches = data.matches.sort((a, b) => {
        const dateA = new Date(a.matchDate).getTime();
        const dateB = new Date(b.matchDate).getTime();
        
        if (matchType === 'finished') {
          // For finished matches: most recent first (descending)
          return dateB - dateA;
        } else {
          // For upcoming matches: closest first (ascending)
          return dateA - dateB;
        }
      });
      
      setMatches(sortedMatches);
    } 
    catch (error) {
      console.error('Error fetching matches:', error);
      setError('Failed to load matches. Please try again later.');
    } 
    finally {
      setLoading(false);
    }
  };

  // Fetch matches when filters change
  useEffect(() => {
    setMatchCount(10); // Reset count when filters change
    fetchMatches();
  }, [team.id, selectedSeason, matchType]);

  // Load more matches
  const loadMore = () => {
    setMatchCount(prev => prev + INCREMENT_AMOUNT);
  };

  // Re-fetch when match count changes (for load more)
  useEffect(() => {
    if (matchCount > 10) {
      fetchMatches();
    }
  }, [matchCount]);

  // Reset count when filters change
  const handleFilterChange = (filterType: string, value: any) => {
    setMatchCount(10);
    
    switch (filterType) {
      case 'season':
        setSelectedSeason(value);
        break;
      case 'matchType':
        setMatchType(value);
        break;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
          <span className="text-white text-xl">⚽</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Matches</h2>
          <p className="text-gray-600">Filter and browse matches for {team.name}</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="mb-6 space-y-4">
        
        {/* Season Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Season:</label>
          <select
            value={selectedSeason}
            onChange={(e) => handleFilterChange('season', parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option key={2025} value={2025}>2024/25</option>
            <option key={2024} value={2024}>2023/24</option>
            <option key={2023} value={2023}>2022/23</option>
            <option key={2022} value={2022}>2021/22</option>
          </select>
        </div>
        
        {/* Match Type Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 max-w-md">
          <button
            onClick={() => handleFilterChange('matchType', 'finished')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
              matchType === 'finished'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Finished Games
          </button>
          <button
            onClick={() => handleFilterChange('matchType', 'upcoming')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
              matchType === 'upcoming'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upcoming Games
          </button>
        </div>
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 text-red-700">
            <span className="text-xl">⚠️</span>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}
      
      {/* Match List */}
      {!loading && !error && (
        <div className="space-y-4">
          {/* Matches */}
          {matches.map((match, index) => (
            <MatchCard 
              key={match.id || index}
              match={match} 
              teamId={team.id} 
              teamName={team.name}
            />
          ))}
          
          {/* Actions and States */}
          {matches.length > 0 ? (
            /* Load More Button - Show if we have matches (API may have more) */
            <div key="load-more-section" className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <span>Load More Matches</span>
                    <span className="text-green-200">({matchCount + INCREMENT_AMOUNT})</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Empty State */
            <div key="empty-state-section" className="text-center py-8">
              <div className="text-4xl mb-2">⚽</div>
              <p className="text-gray-500">
                No {matchType} matches found for {team.name}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                for the {selectedSeason-1}/{selectedSeason.toString().slice(-2)} season
              </p>
            </div>
          )}
        </div>
      )}
      
    </div>
  );
}