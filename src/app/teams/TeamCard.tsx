import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import FootballLoader from '@/components/FootballLoader';
import { TeamWithVenue } from '@/lib/prisma';

interface TeamCardProps {
  team: TeamWithVenue;
}

export default function TeamCard({ team }: TeamCardProps) {
  const [logoError, setLogoError] = useState(false);
  const [logoLoading, setLogoLoading] = useState(true);

  const handleLogoError = () => {
    setLogoError(true);
    setLogoLoading(false);
  };

  const handleLogoLoad = () => {
    setLogoLoading(false);
  };

  return (
    <Link
      href={`/teams/${team.id}`}
      className="group block overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1a17] shadow-[0_24px_60px_rgba(4,10,8,0.7)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/40 hover:shadow-[0_30px_80px_rgba(16,185,129,0.15)]"
    >
      <div className={`relative h-32 overflow-hidden ${team.national ? 'bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.35),transparent_35%),linear-gradient(135deg,#2a220d,#1c140b)]' : 'bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.35),transparent_35%),linear-gradient(135deg,#0f2d22,#0b1d18)]'}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#081612] via-transparent to-black/10" />

        <div className="absolute inset-0 flex items-center justify-center">
          {team.logoUrl && !logoError ? (
            <div className="relative">
              <Image
                src={team.logoUrl}
                alt={`${team.name} logo`}
                width={64}
                height={64}
                unoptimized
                className={`h-16 w-16 object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)] transition-opacity duration-300 ${
                  logoLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onError={handleLogoError}
                onLoad={handleLogoLoad}
              />
              {logoLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <FootballLoader size="sm" text="" className="text-white" />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-white">
              <div className="mb-2 text-3xl">{team.national ? '🌍' : '⚽'}</div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                {team.national ? 'National' : 'Club'}
              </div>
            </div>
          )}
        </div>

        {team.teamCode && (
          <div className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
            {team.teamCode}
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="line-clamp-2 flex-1 text-xl font-black tracking-[-0.04em] text-white transition-colors group-hover:text-emerald-300">
            {team.name}
          </h3>
          <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${team.national ? 'bg-amber-500/10 text-amber-200' : 'bg-emerald-500/10 text-emerald-200'}`}>
            {team.national ? 'National' : 'Club'}
          </span>
        </div>

        <div className="space-y-2.5 text-sm text-slate-300">
          {team.homeVenue && (
            <div className="flex items-center gap-2">
              <span className="text-base text-sky-300">🏟️</span>
              <span className="truncate">{team.homeVenue.name}</span>
            </div>
          )}

          {team.foundedYear && (
            <div className="flex items-center gap-2">
              <span className="text-base text-slate-400">📅</span>
              <span>Founded {team.foundedYear}</span>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            {team.national ? 'National team' : 'Club team'}
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-200 transition group-hover:bg-emerald-500/15">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}