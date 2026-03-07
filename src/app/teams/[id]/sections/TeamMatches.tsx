import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TeamWithCountry, VenueRow } from '@/types';

type TeamWithVenue = TeamWithCountry & {
  home_venue: VenueRow | null;
};

interface TeamMatchesProps {
  team: TeamWithVenue;
}

// Real match data structure from API
interface Match {
  api_id: number;
  home_team: string;
  home_team_logo: string;
  away_team: string;
  away_team_logo: string;
  match_date: string;
  status: string; // "FT", "NS", "1H", "HT", "2H", etc.
  status_long: string;
  home_score?: number | null;
  away_score?: number | null;
  venue: string;
  venue_city: string;
  league: string;
  league_logo: string;
  season: number;
  round: string;
}

interface MatchesResponse {
  matches: Match[];
  team: {
    id: number;
    name: string;
    api_id: number;
  };
  saved_to_db: boolean;
}

export default function TeamMatches({ team }: TeamMatchesProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'recent'>('upcoming');
  const [saving, setSaving] = useState(false);

  // Fetch real matches from Football API
  useEffect(() => {
    const fetchMatches = async () => {
      if (!team.api_id) {
        setError('Team does not have an API ID');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch recent and upcoming matches (last 10 and next 10)
        const response = await fetch(`/api/teams/${team.id}/matches?last=10&next=10&season=2025`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch matches');
        }
        
        const data: MatchesResponse = await response.json();
        setMatches(data.matches);
      } catch (error) {
        console.error('Error fetching matches:', error);
        setError('Failed to load matches. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [team.id, team.api_id]);

  const saveMatchesToDatabase = async () => {
    if (!team.api_id) {
      setError('Team does not have an API ID');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/teams/${team.id}/matches?save=true&last=20&next=20&season=2025`);
      
      if (!response.ok) {
        throw new Error('Failed to save matches');
      }
      
      const data: MatchesResponse = await response.json();
      setMatches(data.matches);
      
      // Show success message briefly
      const successMessage = "Matches saved to database successfully!";
      setError(successMessage);
      setTimeout(() => setError(null), 3000);
    } catch (error) {
      console.error('Error saving matches:', error);
      setError('Failed to save matches to database. Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  const upcomingMatches = matches.filter(match => match.status === 'NS' || match.status === 'TBD');
  const recentMatches = matches.filter(match => match.status === 'FT' || match.status === 'AET' || match.status === 'PEN');

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getMatchResult = (match: Match, teamName: string) => {
    if (match.status !== 'FT' && match.status !== 'AET' && match.status !== 'PEN') return null;
    if (match.home_score === null || match.away_score === null) return null;
    
    const isHome = match.home_team === teamName;
    const teamScore = isHome ? match.home_score : match.away_score;
    const opponentScore = isHome ? match.away_score : match.home_score;
    
    if (teamScore! > opponentScore!) return 'win';
    if (teamScore! < opponentScore!) return 'loss';
    return 'draw';
  };

  return (
    <div className="mb-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
              <span className="text-white text-xl">⚽</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Team Matches</h2>
              <p className="text-gray-600">Recent and upcoming games for {team.name}</p>
            </div>
          </div>
          
          {/* Save to Database Button */}
          {team.api_id && (
            <button
              onClick={saveMatchesToDatabase}
              disabled={saving || loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Save to DB</span>
                </>
              )}
            </button>
          )}
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6 max-w-md">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'upcoming'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upcoming ({upcomingMatches.length})
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'recent'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Recent ({recentMatches.length})
          </button>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        )}
        
        {/* Error/Success State */}
        {error && (
          <div className={`border rounded-lg p-4 mb-4 ${
            error.includes('successfully') 
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className={`flex items-center space-x-2 ${
              error.includes('successfully') 
                ? 'text-green-700'
                : 'text-red-700'
            }`}>
              <span className="text-xl">
                {error.includes('successfully') ? '✅' : '⚠️'}
              </span>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}
        
        {/* Match List */}
        {!loading && !error && (
          <div className="space-y-4">
            {(activeTab === 'upcoming' ? upcomingMatches : recentMatches).map((match, index) => {
              const matchDateTime = formatMatchDate(match.match_date);
              const result = getMatchResult(match, team.name);
              const isHome = match.home_team === team.name;
              
              return (
                <Link
                  key={match.api_id}
                  href={`/matches/${match.api_id}`}
                  className="group block p-4 border border-gray-200 rounded-lg hover:border-green-400 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    
                    {/* Match Info */}
                    <div className="flex-1">
                      
                      {/* League Info */}
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                        <img 
                          src={match.league_logo} 
                          alt={match.league} 
                          className="w-4 h-4 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span>{match.league}</span>
                        <span>•</span>
                        <span>{match.round}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        
                        {/* Teams with Logos */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 text-lg font-semibold">
                            {/* Home Team */}
                            <div className={`flex items-center space-x-2 ${match.home_team === team.name ? 'text-green-600' : 'text-gray-900'}`}>
                              <img 
                                src={match.home_team_logo} 
                                alt={match.home_team}
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <span>{match.home_team}</span>
                            </div>
                            
                            <span className="text-gray-400">vs</span>
                            
                            {/* Away Team */}
                            <div className={`flex items-center space-x-2 ${match.away_team === team.name ? 'text-green-600' : 'text-gray-900'}`}>
                              <img 
                                src={match.away_team_logo} 
                                alt={match.away_team}
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <span>{match.away_team}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3 mt-2 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <span>🏟️</span>
                              <span>{match.venue}</span>
                              {match.venue_city && (
                                <span className="text-gray-400">• {match.venue_city}</span>
                              )}
                            </span>
                            <span className="flex items-center space-x-1">
                              <span>📅</span>
                              <span>{matchDateTime.date}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <span>⏰</span>
                              <span>{matchDateTime.time}</span>
                            </span>
                          </div>
                        </div>
                        
                        {/* Score/Status */}
                        <div className="text-right">
                          {(match.status === 'FT' || match.status === 'AET' || match.status === 'PEN') && 
                           match.home_score !== null && match.away_score !== null ? (
                            <div className="flex items-center space-x-2">
                              <div className="text-2xl font-bold text-gray-900">
                                {match.home_score} - {match.away_score}
                              </div>
                              {result && (
                                <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  result === 'win' ? 'bg-green-100 text-green-800' :
                                  result === 'loss' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {result.toUpperCase()}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                              {match.status === 'NS' ? matchDateTime.time : match.status_long}
                            </div>
                          )}
                        </div>
                        
                      </div>
                    </div>
                    
                  </div>
                </Link>
              );
            })}
            
            {/* Empty State */}
            {(activeTab === 'upcoming' ? upcomingMatches : recentMatches).length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">⚽</div>
                <p className="text-gray-500">
                  No {activeTab} matches found for {team.name}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {activeTab === 'upcoming' ? 'Check back later for scheduled matches' : 'No recent matches available'}
                </p>
              </div>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
}