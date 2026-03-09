import { MatchWithDetails } from '@/types/prisma/match';
import Image from 'next/image';

interface MatchCardProps {
  match: MatchWithDetails;
  teamId: number;
  teamName: string;
}

export default function MatchCard({ match, teamId, teamName }: MatchCardProps) {
  const formatMatchDate = (dateString: string | Date) => {
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

  const getMatchResult = (match: MatchWithDetails, teamId: number) => {
    if (match.statusShort !== 'FT' && match.statusShort !== 'AET' && match.statusShort !== 'PEN') return null;
    if (match.homeScore === null || match.awayScore === null) return null;
    
    const isHome = match.homeTeamId === teamId;
    const teamScore = isHome ? match.homeScore : match.awayScore;
    const opponentScore = isHome ? match.awayScore : match.homeScore;
    
    if (teamScore > opponentScore) return 'win';
    if (teamScore < opponentScore) return 'loss';
    return 'draw';
  };

  const matchDateTime = formatMatchDate(match.matchDate);
  const result = getMatchResult(match, teamId);

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
              <div className="flex items-center space-x-3 text-lg font-semibold">
                {/* Home vs Away */}
                <div className={`${match.homeTeamId === teamId ? 'text-green-600' : 'text-gray-900'}`}>
                  {match.homeTeam?.logoUrl ? (
                    <Image
                      src={match.homeTeam.logoUrl}
                      alt={match.homeTeam.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="text-xl">⚽</span>
                  )}
                  <span className="ml-2">{match.homeTeam?.name || 'Home Team'}</span>
                </div>
                
                <span className="text-gray-400">vs</span>
                
                <div className={`${match.awayTeamId === teamId ? 'text-green-600' : 'text-gray-900'}`}>
                  {match.awayTeam?.logoUrl ? (
                    <Image
                      src={match.awayTeam.logoUrl}
                      alt={match.awayTeam.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="text-xl">⚽</span>
                  )}
                  <span className="ml-2">{match.awayTeam?.name || 'Away Team'}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-2 text-sm text-gray-600">
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
            
            {/* Score */}
            <div className="text-right">
              {match.homeScore !== null && match.awayScore !== null ? (
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold text-gray-900">
                    {match.homeScore} - {match.awayScore}
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
                <div className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                  {match.statusLong}
                </div>
              )}
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  );
}