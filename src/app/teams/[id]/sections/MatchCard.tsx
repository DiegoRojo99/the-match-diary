import { MatchWithDetails } from '@/types/prisma/match';
import Image from 'next/image';

interface MatchCardProps {
  match: MatchWithDetails;
  teamId: number;
  teamName: string;
}

interface TeamDisplayProps {
  team: { name: string; logoUrl?: string | null } | null | undefined;
  isUserTeam: boolean;
  fallbackName: string;
}

function TeamDisplay({ team, isUserTeam, fallbackName }: TeamDisplayProps) {
  return (
    <div className={`flex flex-col items-center space-y-2 flex-1 ${
      isUserTeam ? 'text-green-600' : 'text-gray-800'
    }`}>
      <div className="flex-shrink-0">
        {team?.logoUrl ? (
          <Image
            src={team.logoUrl}
            alt={team.name || fallbackName}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-gray-500 text-xs">⚽</span>
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="font-semibold text-sm md:text-base leading-tight">
          {team?.name || fallbackName}
        </p>
      </div>
    </div>
  );
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
  const isFinished = match.statusShort === 'FT' || match.statusShort === 'AET' || match.statusShort === 'PEN';

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 md:p-6">
      
      {/* Header: Date, Competition, Venue */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 text-sm text-gray-500">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <span className="flex items-center space-x-1">
            <span>📅</span>
            <span className="font-medium">{matchDateTime.date}</span>
            <span>•</span>
            <span>{matchDateTime.time}</span>
          </span>
        </div>
        
        {match.competition && (
          <div className="flex items-center space-x-2">
            {match.competition.logoUrl ? (
              <Image
                src={match.competition.logoUrl}
                alt={match.competition.name}
                width={16}
                height={16}
                className="rounded"
              />
            ) : (
              <span className="text-xs">🏆</span>
            )}
            <span className="font-medium truncate">{match.competition.name}</span>
          </div>
        )}
      </div>

      {/* Main Match Content */}
      <div className="flex flex-col space-y-4">
        
        {/* Teams Section */}
        <div className="flex items-center justify-between">
          
          {/* Home Team */}
          <TeamDisplay 
            team={match.homeTeam}
            isUserTeam={match.homeTeamId === teamId}
            fallbackName="Home Team"
          />

          {/* Score/Status */}
          <div className="flex-shrink-0 mx-4">
            {isFinished && match.homeScore !== null && match.awayScore !== null ? (
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900 leading-none">
                  {match.homeScore} - {match.awayScore}
                </div>
                {result && (
                  <div className={`mt-1 px-2 py-1 rounded-full text-xs font-bold ${
                    result === 'win' ? 'bg-green-100 text-green-700' :
                    result === 'loss' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {result.toUpperCase()}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="px-3 py-2 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full whitespace-nowrap">
                  {match.statusShort === 'NS' ? matchDateTime.time : match.statusLong}
                </div>
              </div>
            )}
          </div>

          {/* Away Team */}
          <TeamDisplay 
            team={match.awayTeam}
            isUserTeam={match.awayTeamId === teamId}
            fallbackName="Away Team"
          />
        </div>

        {/* Bottom Info: Venue */}
        {match.venue && (
          <div className="flex items-center justify-center pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>🏟️</span>
              <span className="truncate">{match.venue.name}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}