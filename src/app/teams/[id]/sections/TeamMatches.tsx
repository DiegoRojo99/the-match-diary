import { useState, useEffect, useCallback } from 'react';
import MatchCard from './MatchCard';
import { MatchWithDetails } from '@/types/prisma/match';
import FootballLoader from '@/components/FootballLoader';
import { TeamWithVenue } from '@/lib/prisma';

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
  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let url = `/api/teams/${team.id}/matches?season=${selectedSeason}`;

      if (matchType === 'finished') url += `&last=${matchCount}`;
      else url += `&next=${matchCount}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch matches');

      const data: MatchesResponse = await response.json();

      const sortedMatches = data.matches.sort((a, b) => {
        const dateA = new Date(a.matchDate).getTime();
        const dateB = new Date(b.matchDate).getTime();

        if (matchType === 'finished') {
          return dateB - dateA;
        }

        return dateA - dateB;
      });

      setMatches(sortedMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setError('Failed to load matches. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [matchCount, matchType, selectedSeason, team.id]);

  // Fetch matches when filters change
  useEffect(() => {
    setMatchCount(10);
    fetchMatches();
  }, [fetchMatches]);

  // Load more matches
  const loadMore = () => {
    setMatchCount(prev => prev + INCREMENT_AMOUNT);
  };

  useEffect(() => {
    if (matchCount > 10) {
      fetchMatches();
    }
  }, [fetchMatches, matchCount]);

  // Reset count when filters change
  const handleFilterChange = (
    filterType: 'season' | 'matchType',
    value: number | 'finished' | 'upcoming'
  ) => {
    setMatchCount(10);

    switch (filterType) {
      case 'season':
        setSelectedSeason(typeof value === 'number' ? value : selectedSeason);
        break;
      case 'matchType':
        setMatchType(value === 'finished' || value === 'upcoming' ? value : 'finished');
        break;
    }
  };

  return (
    <div className="rounded-[28px] border border-white/10 bg-[#0b1a17] p-5 shadow-[0_24px_60px_rgba(4,10,8,0.8)] md:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-xl shadow-[0_14px_32px_rgba(16,185,129,0.25)]">
          ⚽
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-[-0.05em] text-white">Team Matches</h2>
          <p className="text-sm text-slate-400">Filter and browse matches for {team.name}</p>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Season</label>
          <select
            value={selectedSeason}
            onChange={(e) => handleFilterChange('season', parseInt(e.target.value))}
            className="rounded-full border border-white/10 bg-[#081612] px-4 py-2.5 text-sm text-white focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value={2025}>2024/25</option>
            <option value={2024}>2023/24</option>
            <option value={2023}>2022/23</option>
            <option value={2022}>2021/22</option>
          </select>
        </div>

        <div className="flex max-w-lg gap-1 rounded-full border border-white/10 bg-[#081612] p-1">
          <button
            onClick={() => handleFilterChange('matchType', 'finished')}
            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
              matchType === 'finished'
                ? 'bg-emerald-500 text-[#062217]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Finished Games
          </button>
          <button
            onClick={() => handleFilterChange('matchType', 'upcoming')}
            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
              matchType === 'upcoming'
                ? 'bg-emerald-500 text-[#062217]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Upcoming Games
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <FootballLoader size="lg" text="Loading matches..." />
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-[20px] border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {matches.map((match, index) => (
            <MatchCard
              key={match.id || index}
              match={match}
              teamId={team.id}
            />
          ))}

          {matches.length > 0 ? (
            <div key="load-more-section" className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={loading}
                className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-emerald-200 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <FootballLoader size="sm" text="" className="text-white" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <span>Load More Matches</span>
                    <span className="text-emerald-100">({matchCount + INCREMENT_AMOUNT})</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div key="empty-state-section" className="rounded-[22px] border border-white/10 bg-[#081612] px-6 py-10 text-center">
              <div className="mb-3 text-4xl">⚽</div>
              <p className="text-lg font-semibold text-white">
                No {matchType} matches found for {team.name}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                for the {selectedSeason - 1}/{selectedSeason.toString().slice(-2)} season
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}