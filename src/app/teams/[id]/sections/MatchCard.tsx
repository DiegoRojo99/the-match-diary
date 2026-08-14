import { createClient } from '@supabase/supabase-js';
import { MatchWithDetails } from '@/types/prisma/match';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface MatchCardProps {
  match: MatchWithDetails;
  teamId: number;
}

interface TeamDisplayProps {
  team: { id: number; name: string; logoUrl?: string | null } | null | undefined;
  isUserTeam: boolean;
  fallbackName: string;
}

function TeamDisplay({ team, isUserTeam, fallbackName }: TeamDisplayProps) {
  const teamContent = (
    <div className={`flex flex-1 flex-col items-center space-y-2 ${
      isUserTeam ? 'text-emerald-300' : 'text-slate-100'
    }`}>
      <div className="flex-shrink-0">
        {team?.logoUrl ? (
          <Image
            src={team.logoUrl}
            alt={team.name || fallbackName}
            width={32}
            height={32}
            className="rounded-full border border-white/10 bg-[#081612]"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[#081612] text-[10px] text-slate-300">
            ⚽
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-bold leading-tight text-inherit md:text-base">
          {team?.name || fallbackName}
        </p>
      </div>
    </div>
  );

  if (team?.id) {
    return (
      <Link href={`/teams/${team.id}`} className="flex-1">
        {teamContent}
      </Link>
    );
  }

  return teamContent;
}

export default function MatchCard({ match, teamId }: MatchCardProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToDiary = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsAdding(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/user/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          match_id: match.id,
          attended_date: match.matchDate ?? new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? 'Failed to add match to diary');
      }

      setIsAdded(true);
    } catch (error) {
      console.error('Failed to add match to diary:', error);
    } finally {
      setIsAdding(false);
    }
  };

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
    <div className="rounded-[24px] border border-white/10 bg-[#0b1a17] p-4 shadow-[0_24px_60px_rgba(4,10,8,0.7)] transition-all duration-200 hover:border-emerald-400/35 md:p-5">
      <div className="mb-4 flex flex-col gap-2 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-slate-400">
          <span>📅</span>
          <span className="font-medium text-slate-300">{matchDateTime.date}</span>
          <span className="text-slate-500">•</span>
          <span>{matchDateTime.time}</span>
        </div>

        {match.competition && (
          <div className="flex items-center gap-2 text-slate-300">
            {match.competition.logoUrl ? (
              <Image
                src={match.competition.logoUrl}
                alt={match.competition.name}
                width={16}
                height={16}
                className="h-4 w-4 rounded-sm object-contain"
              />
            ) : (
              <span className="text-xs">🏆</span>
            )}
            <span className="max-w-[200px] truncate text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              {match.competition.name}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <TeamDisplay
            team={match.homeTeam}
            isUserTeam={match.homeTeamId === teamId}
            fallbackName="Home Team"
          />

          <div className="mx-2 flex-shrink-0">
            {isFinished && match.homeScore !== null && match.awayScore !== null ? (
              <div className="text-center">
                <div className="text-2xl font-black tracking-[-0.06em] text-white md:text-3xl">
                  {match.homeScore} - {match.awayScore}
                </div>
                {result && (
                  <div className={`mt-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                    result === 'win' ? 'bg-emerald-500/10 text-emerald-200' :
                    result === 'loss' ? 'bg-red-500/10 text-red-200' :
                    'bg-amber-500/10 text-amber-200'
                  }`}>
                    {result.toUpperCase()}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200 whitespace-nowrap">
                  {match.statusShort === 'NS' ? matchDateTime.time : match.statusLong}
                </div>
              </div>
            )}
          </div>

          <TeamDisplay
            team={match.awayTeam}
            isUserTeam={match.awayTeamId === teamId}
            fallbackName="Away Team"
          />
        </div>

        {match.venue && (
          <div className="flex items-center justify-center border-t border-white/10 pt-3 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <span>🏟️</span>
              <span className="truncate">{match.venue.name}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2 border-t border-white/10 pt-4">
        <Link
          href={`/matches/${match.id}`}
          className="flex-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-center text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/15"
        >
          View match
        </Link>
        <button
          type="button"
          onClick={handleAddToDiary}
          disabled={isAdding || isAdded}
          className="rounded-full border border-white/10 bg-[#081612] px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/40 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isAdding ? 'Adding...' : isAdded ? 'Added to diary' : 'Add to diary'}
        </button>
      </div>
    </div>
  );
}