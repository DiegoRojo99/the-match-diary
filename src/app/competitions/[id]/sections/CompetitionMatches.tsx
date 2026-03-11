import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import FootballLoader from '@/components/FootballLoader';
import { MatchWithDetails } from '@/types/prisma/match';
import { CompetitionWithCountry } from '@/lib/prisma';

interface CompetitionMatchesProps {
  competition: CompetitionWithCountry;
}

interface MatchesResponse {
  matches: MatchWithDetails[];
  matchweeks: number[];
}

function formatMatchDate(dateString: string | Date) {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  };
}

function MatchRow({ match }: { match: MatchWithDetails }) {
  const { date, time } = formatMatchDate(match.matchDate);
  const isFinished =
    match.statusShort === 'FT' || match.statusShort === 'AET' || match.statusShort === 'PEN';

  return (
    <Link href={`/matches/${match.id}`}>
      <div className="bg-gray-50 hover:bg-purple-50 border border-gray-200 rounded-xl p-4 transition-colors cursor-pointer">
        {/* Date / Week */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>
            📅 {date} · {time}
          </span>
          {match.matchWeek && (
            <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">
              Week {match.matchWeek}
            </span>
          )}
        </div>

        {/* Teams + Score */}
        <div className="flex items-center justify-between gap-2">
          {/* Home team */}
          <div className="flex flex-col items-center flex-1 gap-1 text-center">
            {match.homeTeam?.logoUrl ? (
              <Image
                src={match.homeTeam.logoUrl}
                alt={match.homeTeam.name}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs">⚽</div>
            )}
            <span className="text-sm font-semibold text-gray-800 line-clamp-1">
              {match.homeTeam?.name ?? 'Home'}
            </span>
          </div>

          {/* Score / Status */}
          <div className="flex-shrink-0 text-center min-w-[60px]">
            {isFinished && match.homeScore !== null && match.awayScore !== null ? (
              <span className="text-2xl font-bold text-gray-900">
                {match.homeScore} – {match.awayScore}
              </span>
            ) : (
              <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-full whitespace-nowrap">
                {match.statusShort === 'NS' ? time : (match.statusLong ?? match.statusShort)}
              </span>
            )}
          </div>

          {/* Away team */}
          <div className="flex flex-col items-center flex-1 gap-1 text-center">
            {match.awayTeam?.logoUrl ? (
              <Image
                src={match.awayTeam.logoUrl}
                alt={match.awayTeam.name}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs">⚽</div>
            )}
            <span className="text-sm font-semibold text-gray-800 line-clamp-1">
              {match.awayTeam?.name ?? 'Away'}
            </span>
          </div>
        </div>

        {/* Venue */}
        {match.venue && (
          <div className="flex items-center justify-center mt-3 text-xs text-gray-500">
            <span className="mr-1">🏟️</span>
            <span className="truncate">{match.venue.name}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function CompetitionMatches({ competition }: CompetitionMatchesProps) {
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [matchweeks, setMatchweeks] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const [selectedSeason, setSelectedSeason] = useState(currentYear);
  const [selectedMatchweek, setSelectedMatchweek] = useState<number | null>(null);

  const seasons = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const fetchMatches = useCallback(async (season: number, matchweek: number | null) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ season: String(season) });
      if (matchweek !== null) params.set('matchweek', String(matchweek));
      const res = await fetch(`/api/competitions/${competition.id}/matches?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch matches');
      const data: MatchesResponse = await res.json();
      setMatches(data.matches);
      setMatchweeks(data.matchweeks);
    } catch (err) {
      console.error(err);
      setError('Failed to load matches. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [competition.id]);

  useEffect(() => {
    setSelectedMatchweek(null);
    fetchMatches(selectedSeason, null);
  }, [selectedSeason, competition.id, fetchMatches]);

  const handleMatchweekChange = (mw: number | null) => {
    setSelectedMatchweek(mw);
    fetchMatches(selectedSeason, mw);
  };

  const isLeague = competition.type === 'League';

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-2 rounded-lg">
          <span className="text-white text-xl">⚽</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Matches</h2>
          <p className="text-gray-600">Browse matches for {competition.name}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Season */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Season:</label>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {seasons.map((y) => (
              <option key={y} value={y}>
                {y - 1}/{String(y).slice(-2)}
              </option>
            ))}
          </select>
        </div>

        {/* Matchweek selector (only shown for leagues and when matchweeks are available) */}
        {isLeague && matchweeks.length > 0 && (
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <label className="text-sm font-medium text-gray-700">Matchweek:</label>
            <button
              onClick={() => handleMatchweekChange(null)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedMatchweek === null
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {matchweeks.map((mw) => (
              <button
                key={mw}
                onClick={() => handleMatchweekChange(mw)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedMatchweek === mw
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mw}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <FootballLoader size="lg" text="Loading matches..." />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 text-red-700">
            <span>⚠️</span>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Matches */}
      {!loading && !error && (
        <div className="space-y-3">
          {matches.length > 0 ? (
            matches.map((match) => <MatchRow key={match.id} match={match} />)
          ) : (
            <div className="text-center py-10">
              <div className="text-5xl mb-3">⚽</div>
              <p className="text-gray-500 font-medium">No matches found</p>
              <p className="text-gray-400 text-sm mt-1">
                for the {selectedSeason - 1}/{String(selectedSeason).slice(-2)} season
                {selectedMatchweek ? `, matchweek ${selectedMatchweek}` : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
