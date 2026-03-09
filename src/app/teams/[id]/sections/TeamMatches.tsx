import { useState, useEffect } from 'react';
import Link from 'next/link';
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

  // Fetch recent matches only
  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch last 10 matches for the current season
        const response = await fetch(`/api/teams/${team.id}/matches?last=10&season=2025`);
        
        if (!response.ok) throw new Error('Failed to fetch matches');
        
        // Only show completed matches
        const data: MatchesResponse = await response.json();
        setMatches(data.matches);
      } 
      catch (error) {
        console.error('Error fetching matches:', error);
        setError('Failed to load matches. Please try again later.');
      } 
      finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [team.id]);

  return (
    <div className="mb-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
            <span className="text-white text-xl">⚽</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Recent Matches</h2>
            <p className="text-gray-600">Latest completed games for {team.name}</p>
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
            {matches.map((match) => (
              <MatchCard 
                key={match.id}
                match={match} 
                teamId={team.id} 
                teamName={team.name}
              />
            ))}            
            {/* Empty State */}
            {matches.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">⚽</div>
                <p className="text-gray-500">
                  No recent matches found for {team.name}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Recent completed matches will appear here
                </p>
              </div>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
}