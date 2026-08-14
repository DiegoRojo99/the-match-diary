import Image from 'next/image';
import { useState } from 'react';
import FootballLoader from '@/components/FootballLoader';
import { TeamWithVenue } from '@/lib/prisma';

interface TeamHeaderProps {
  team: TeamWithVenue;
}

export default function TeamHeader({ team }: TeamHeaderProps) {
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
    <div className="mb-8 overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),transparent_35%),linear-gradient(135deg,#081a12,#0d261d_45%,#06140d)] px-6 py-8 shadow-[0_30px_80px_rgba(4,10,8,0.8)] md:px-8">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-emerald-400/30 bg-black/20 ring-4 ring-emerald-500/10 md:h-28 md:w-28">
          {team.logoUrl && !logoError ? (
            <Image
              src={team.logoUrl}
              alt={`${team.name} logo`}
              width={112}
              height={112}
              unoptimized
              className={`h-full w-full object-contain transition-opacity duration-300 ${
                logoLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onError={handleLogoError}
              onLoad={handleLogoLoad}
            />
          ) : (
            <div className="text-4xl md:text-5xl">{team.national ? '🌍' : '⚽'}</div>
          )}

          {logoLoading && team.logoUrl && !logoError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <FootballLoader size="md" text="" />
            </div>
          )}
        </div>

        <div className="mb-3 flex items-center gap-3">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${team.national ? 'bg-amber-500/10 text-amber-200' : 'bg-emerald-500/10 text-emerald-200'}`}>
            {team.national ? 'National team' : 'Club'}
          </span>
          {team.teamCode && (
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-300">
              {team.teamCode}
            </span>
          )}
        </div>

        <h1 className="text-4xl font-black tracking-[-0.06em] text-white md:text-5xl">
          {team.name}
        </h1>

        {team.homeVenue && (
          <div className="mt-4 flex items-center justify-center gap-2 text-slate-300">
            <span className="text-lg">🏟️</span>
            <span className="text-lg font-medium">{team.homeVenue.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}