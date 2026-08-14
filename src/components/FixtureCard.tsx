'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { DiscoverFixtureNormalized } from '@/types';

export default function FixtureCard({ fixture }: {fixture: DiscoverFixtureNormalized}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_60px_rgba(4,10,8,0.7)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {fixture.competition.logoUrl && (
            <Image
              src={fixture.competition.logoUrl}
              alt={fixture.competition.name ?? 'Competition logo'}
              width={18}
              height={18}
              unoptimized
              className="h-4 w-4 shrink-0 object-contain"
            />
          )}
          <span className="truncate">{fixture.competition.name}</span>
        </div>
        <span className="shrink-0 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
          {fixture.status.short ?? 'TBD'}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-[22px] border border-white/5 bg-[#0b1a17] p-4">
        <div className="flex min-w-0 flex-1 flex-col items-center text-center">
          {fixture.homeTeam.logoUrl && (
            <Image
              src={fixture.homeTeam.logoUrl}
              alt={fixture.homeTeam.name ?? 'Home team logo'}
              width={40}
              height={40}
              unoptimized
              className="mb-2 h-10 w-10 object-contain"
            />
          )}
          <span className="max-w-full truncate text-sm font-bold text-white">{fixture.homeTeam.name}</span>
        </div>

        <div className="flex min-w-[72px] flex-col items-center text-center">
          <div className="text-2xl font-black tracking-[-0.06em] text-white">
            {fixture.goals.home ?? '—'}
            <span className="mx-2 text-slate-500">-</span>
            {fixture.goals.away ?? '—'}
          </div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            {!!fixture.date && new Date(fixture.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-center text-center">
          {fixture.awayTeam.logoUrl && (
            <Image
              src={fixture.awayTeam.logoUrl}
              alt={fixture.awayTeam.name ?? 'Away team logo'}
              width={40}
              height={40}
              unoptimized
              className="mb-2 h-10 w-10 object-contain"
            />
          )}
          <span className="max-w-full truncate text-sm font-bold text-white">{fixture.awayTeam.name}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 break-words">
          {fixture.venue ? `${fixture.venue.name}${fixture.venue.city ? ` · ${fixture.venue.city}` : ''}` : 'Venue TBC'}
        </div>
        <div className="text-left text-slate-400 sm:text-right">
          {!!fixture.date && new Date(fixture.date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          href={`/matches/${fixture.id}`}
          className="flex-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-center text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/15"
        >
          View match
        </Link>
        <Link
          href={`/matches/${fixture.id}`}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/40 hover:text-emerald-300"
        >
          Add to diary
        </Link>
      </div>
    </div>
  );
}
