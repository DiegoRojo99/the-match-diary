import Link from 'next/link';
import { UserMatchWithMatch } from '@/types/prisma/match';
import { Team } from '@prisma/client';

const FINISHED_STATUSES = ['FT', 'AET', 'PEN'];

function RatingDisplay({ rating }: { rating: number }) {
  const getColor = (rating: number) => {
    if (rating <= 3) return 'text-red-500';
    if (rating <= 5) return 'text-yellow-500';
    if (rating <= 7) return 'text-green-500';
    return 'text-blue-500';
  };

  return (
    <span className={`text-sm font-semibold ${getColor(rating)}`}>
      {rating}/10
    </span>
  );
}

interface VisitCardProps {
  visit: UserMatchWithMatch;
  onDelete: (visitId: string) => void;
  deletingId: string | null;
}

export default function VisitCard({ visit, onDelete, deletingId }: VisitCardProps) {
  const m = visit.match;
  const isFinished = m?.statusShort ? FINISHED_STATUSES.includes(m.statusShort) : false;
  const attendedDate = new Date(visit.attendedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Teams & Score */}
      <Link href={`/matches/${visit.matchId}`} className="block group">
        <div className="flex items-center justify-between gap-2">
          {/* Home team */}
          {teamDisplay(m?.homeTeam ?? null)}

          {/* Score */}
          <div className="flex flex-col items-center min-w-[60px]">
            {isFinished && m != null && m.homeScore !== null && m.awayScore !== null ? (
              <span className="text-2xl font-extrabold text-gray-900">
                {m.homeScore}–{m.awayScore}
              </span>
            ) : (
              <span className="text-lg font-bold text-gray-400">vs</span>
            )}
          </div>

          {/* Away team */}
          {teamDisplay(m?.awayTeam ?? null)}
        </div>
      </Link>

      {/* Metadata */}
      <VisitCardMeta visit={visit} />

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Link
          href={`/matches/${visit.matchId}`}
          className="flex-1 text-center px-3 py-1.5 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          View Match
        </Link>
        <button
          onClick={() => onDelete(visit.id)}
          disabled={deletingId === visit.id}
          className="px-3 py-1.5 text-sm border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
        >
          {deletingId === visit.id ? '...' : 'Remove'}
        </button>
      </div>
    </div>
  );
}

function teamDisplay(team: Team | null) {
  if (!team) {
    return (
      <div className="flex-1 flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-1">
          <span className="text-lg font-bold text-gray-400">?</span>
        </div>
        <span className="text-sm font-semibold text-gray-800 group-hover:text-green-600 transition-colors line-clamp-2">
          Unknown Team
        </span>
      </div>
    )
  }

  const teamName = team.name ?? 'Unknown Team';
  return (
    <div className="flex-1 flex flex-col items-center text-center">
      {team.logoUrl ? (
        <img
          src={team.logoUrl}
          alt={teamName}
          className="w-12 h-12 object-contain mb-1"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      ) : (
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-1">
          <span className="text-lg font-bold text-gray-400">
            {teamName.charAt(0)}
          </span>
        </div>
      )}
      <span className="text-sm font-semibold text-gray-800 group-hover:text-green-600 transition-colors line-clamp-2">
        {teamName}
      </span>
    </div>
  )
}

function VisitCardMeta({ visit }: { visit: UserMatchWithMatch }) {
  const m = visit.match;
  const attendedDate = new Date(visit.attendedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm text-gray-500">
      {m?.competition && (
        <div className="flex items-center gap-2">
          {m.competition.logoUrl && (
            <img
              src={m.competition.logoUrl}
              alt={m.competition.name}
              className="w-4 h-4 object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          <span>{m.competition.name}</span>
        </div>
      )}
      {m?.venue && (
        <div className="flex items-center gap-2">
          <span>🏟️</span>
          <span>{m.venue.name}</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <span>📅</span>
        <span>Attended: {attendedDate}</span>
      </div>
      {visit.rating && (
        <div className="flex items-center gap-2">
          <span>⭐</span>
          <RatingDisplay rating={visit.rating} />
        </div>
      )}
      {visit.notes && (
        <div className="flex items-start gap-2">
          <span>📝</span>
          <span className="line-clamp-2 italic">{visit.notes}</span>
        </div>
      )}
    </div>
  );
}

export function VisitCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 animate-pulse">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="w-24 h-12 bg-gray-200 rounded-lg"></div>
        <div className="w-16 h-8 bg-gray-200 rounded-lg"></div>
        <div className="w-24 h-12 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="space-y-2">
        <div className="w-3/4 h-4 bg-gray-200 rounded-lg"></div>
        <div className="w-1/2 h-4 bg-gray-200 rounded-lg"></div>
        <div className="w-5/6 h-4 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="flex gap-2 mt-4">
        <div className="flex-1 h-8 bg-gray-200 rounded-lg"></div>
        <div className="w-24 h-8 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}