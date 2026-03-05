import { useState, useEffect } from 'react';
import { TeamWithCountry, VenueRow } from '@/types';

type TeamWithVenue = TeamWithCountry & {
  home_venue: VenueRow | null;
};

interface TeamMatchesProps {
  team: TeamWithVenue;
}

// Mock match data structure
interface Match {
  id: number;
  home_team: string;
  away_team: string;
  match_date: string;
  status: 'upcoming' | 'completed' | 'live';
  home_score?: number;
  away_score?: number;
  venue: string;
}

export default function TeamMatches({ team }: TeamMatchesProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'recent'>('upcoming');

  // Mock data - in real app, this would fetch from API
  useEffect(() => {
    // Simulate loading
    setLoading(true);
    
    // Mock matches data
    const mockMatches: Match[] = [
      {
        id: 1,
        home_team: team.name,
        away_team: "Arsenal FC",
        match_date: "2026-03-10T15:00:00Z",
        status: "upcoming",
        venue: team.home_venue?.name || "Stadium"
      },
      {
        id: 2,
        home_team: "Liverpool FC",
        away_team: team.name,
        match_date: "2026-03-17T14:30:00Z",
        status: "upcoming",
        venue: "Anfield Stadium"
      },
      {
        id: 3,
        home_team: team.name,
        away_team: "Chelsea FC",
        match_date: "2026-02-28T16:00:00Z",
        status: "completed",
        home_score: 2,
        away_score: 1,
        venue: team.home_venue?.name || "Stadium"
      },
      {
        id: 4,
        home_team: "Manchester City",
        away_team: team.name,
        match_date: "2026-02-21T12:30:00Z",
        status: "completed",
        home_score: 1,
        away_score: 0,
        venue: "Etihad Stadium"
      }
    ];

    setTimeout(() => {
      setMatches(mockMatches);
      setLoading(false);
    }, 500);
  }, [team.name, team.home_venue]);

  const upcomingMatches = matches.filter(match => match.status === 'upcoming');
  const recentMatches = matches.filter(match => match.status === 'completed');

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
    if (match.status !== 'completed') return null;
    
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
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
            <span className="text-white text-xl">⚽</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Team Matches</h2>
            <p className="text-gray-600">Recent and upcoming games for {team.name}</p>
          </div>
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
        
        {/* Match List */}
        {!loading && (
          <div className="space-y-4">
            {(activeTab === 'upcoming' ? upcomingMatches : recentMatches).map((match, index) => {
              const matchDateTime = formatMatchDate(match.match_date);
              const result = getMatchResult(match, team.name);
              const isHome = match.home_team === team.name;
              
              return (
                <div
                  key={match.id}
                  className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    
                    {/* Match Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        
                        {/* Teams */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 text-lg font-semibold">
                            <span className={match.home_team === team.name ? 'text-green-600' : 'text-gray-900'}>
                              {match.home_team}
                            </span>
                            <span className="text-gray-400">vs</span>
                            <span className={match.away_team === team.name ? 'text-green-600' : 'text-gray-900'}>
                              {match.away_team}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <span>🏟️</span>
                              <span>{match.venue}</span>
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
                          {match.status === 'completed' && match.home_score !== undefined && match.away_score !== undefined ? (
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
                              {matchDateTime.time}
                            </div>
                          )}
                        </div>
                        
                      </div>
                    </div>
                    
                  </div>
                </div>
              );
            })}
            
            {/* Empty State */}
            {(activeTab === 'upcoming' ? upcomingMatches : recentMatches).length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">⚽</div>
                <p className="text-gray-500">
                  No {activeTab} matches found for {team.name}
                </p>
              </div>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
}