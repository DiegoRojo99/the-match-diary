import Image from 'next/image';
import Link from 'next/link';
import { UserMatchWithMatch } from '@/types/prisma/match';
import { Team } from '@prisma/client';

const FINISHED_STATUSES = ['FT', 'AET', 'PEN'];

interface VisitCardProps {
  visit: UserMatchWithMatch;
  onDelete: (visitId: string) => void;
  deletingId: string | null;
}

export default function VisitCard({ visit, onDelete, deletingId }: VisitCardProps) {
  const m = visit.match;
  const isFinished = m?.statusShort ? FINISHED_STATUSES.includes(m.statusShort) : false;

  return (
    <div className="group flex flex-col gap-4 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,20,0.96),rgba(8,17,14,0.9))] p-5 shadow-[0_18px_50px_rgba(4,8,7,0.45)] transition duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:shadow-[0_24px_60px_rgba(16,185,129,0.12)]">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">
          Match memory
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          {formatMemoryDate(visit.attendedDate)}
        </span>
      </div>

      <Link href={`/matches/${visit.matchId}`} className="block">
        <div className="rounded-[22px] border border-white/5 bg-[#0b1a17] p-3">
          {(m?.competition || m?.venue) && (
            <div className="mb-4 flex flex-wrap items-center justify-center gap-1.5 text-center">
              {m?.competition && (
                <div className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-200">
                  {m.competition.logoUrl && (
                    <Image
                      src={m.competition.logoUrl}
                      alt={m.competition.name}
                      width={12}
                      height={12}
                      unoptimized
                      className="h-3 w-3 object-contain"
                    />
                  )}
                  <span>{m.competition.name}</span>
                </div>
              )}

              {m?.venue && (
                <div className="inline-flex items-center justify-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-200">
                  <span>🏟️</span>
                  <span className="line-clamp-1">{m.venue.name}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            {teamDisplay(m?.homeTeam ?? null)}

            <div className="flex min-w-[82px] flex-col items-center justify-center">
              {isFinished && m != null && m.homeScore !== null && m.awayScore !== null ? (
                <span className="text-2xl font-black tracking-[-0.06em] text-white">{m.homeScore}-{m.awayScore}</span>
              ) : (
                <span className="text-base font-bold uppercase tracking-[0.16em] text-slate-400">vs</span>
              )}
            </div>

            {teamDisplay(m?.awayTeam ?? null)}
          </div>
        </div>
      </Link>

      <VisitCardMeta visit={visit} />

      <div className="flex gap-2 pt-1">
        <Link
          href={`/matches/${visit.matchId}`}
          className="flex-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-center text-sm font-semibold text-emerald-200 transition hover:border-emerald-300/60 hover:bg-emerald-500/15"
        >
          View match
        </Link>
        <button
          onClick={() => onDelete(visit.id)}
          disabled={deletingId === visit.id}
          className="rounded-full border border-red-400/30 bg-red-500/5 px-3 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
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
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg font-bold text-slate-400">
          ?
        </div>
        <span className="max-w-[88px] text-xs font-semibold text-slate-300">Unknown Team</span>
      </div>
    );
  }

  const teamName = team.name ?? 'Unknown Team';

  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      {team.logoUrl ? (
        <Image
          src={team.logoUrl}
          alt={teamName}
          width={48}
          height={48}
          unoptimized
          className="mb-2 h-12 w-12 object-contain"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      ) : (
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg font-bold text-slate-300">
          {teamName.charAt(0)}
        </div>
      )}
      <span className="max-w-[88px] text-center text-xs font-semibold text-white">
        {teamName}
      </span>
    </div>
  );
}

function VisitCardMeta({ visit }: { visit: UserMatchWithMatch }) {
  return (
    <div className="mt-1 space-y-2 border-t border-white/10 pt-3 text-sm text-slate-300">
      {visit.notes && (
        <div className="rounded-2xl border border-sky-400/20 bg-sky-500/5 p-3">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200">
            <span>Memory</span>
          </div>
          <span className="line-clamp-3 text-sm leading-6 italic text-slate-200">{visit.notes}</span>
        </div>
      )}
    </div>
  );
}

function formatMemoryDate(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Match day';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function VisitCardSkeleton() {
  return (
    <div className="animate-pulse rounded-[28px] border border-white/10 bg-[#0d1a17] p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="h-12 w-20 rounded-xl bg-white/10"></div>
        <div className="h-8 w-16 rounded-full bg-white/10"></div>
        <div className="h-12 w-20 rounded-xl bg-white/10"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded bg-white/10"></div>
        <div className="h-4 w-1/2 rounded bg-white/10"></div>
        <div className="h-4 w-5/6 rounded bg-white/10"></div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-9 flex-1 rounded-full bg-white/10"></div>
        <div className="h-9 w-20 rounded-full bg-white/10"></div>
      </div>
    </div>
  );
}