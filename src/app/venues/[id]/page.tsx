'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import FootballLoader from '@/components/FootballLoader';
import { VenueWithDetails } from '@/lib/prisma';

const ArrowLeftIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const MapPinIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const UsersIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);

export default function VenuePage() {
  const params = useParams();
  const [venue, setVenue] = useState<VenueWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchVenue = async () => {
      if (!params.id) return;

      try {
        const response = await fetch(`/api/venues/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch venue');

        const data = await response.json();
        setVenue(data);
      } catch (error) {
        console.error('Error fetching venue:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenue();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05150f]">
        <FootballLoader size="xl" text="Loading venue details..." />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-[#05150f] text-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <div className="mb-6 text-7xl">🏟️</div>
          <h3 className="text-3xl font-black text-white">Venue not found</h3>
          <p className="mt-3 text-slate-400">The venue you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/venues" className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-sky-500 px-6 py-3 text-sm font-black text-slate-950 shadow-[0_18px_40px_rgba(56,189,248,0.35)]">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to venues
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05150f] text-white">
      <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
        {venue.imageUrl && !imageError ? (
          <Image src={venue.imageUrl} alt={venue.name} fill className="object-cover" priority onError={() => setImageError(true)} />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.28),transparent_35%),linear-gradient(135deg,#0b1930,#0f2e3f_45%,#06150f)]">
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center text-center text-white">
              <div>
                <div className="text-7xl">🏟️</div>
                <h2 className="mt-4 text-2xl font-bold uppercase tracking-[0.25em] text-sky-200">Stadium</h2>
              </div>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#05150f] via-[#05150f]/25 to-transparent" />

        <div className="absolute left-6 top-6 z-10">
          <Link href="/venues" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-sky-400/50 hover:bg-white/20">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to venues
          </Link>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-4xl font-black tracking-tight md:text-6xl">{venue.name}</h1>
            {venue.address && (
              <div className="mt-3 flex items-center gap-2 text-base text-slate-200 md:text-lg">
                <MapPinIcon className="h-5 w-5 text-sky-300" />
                <span>{venue.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.6fr_0.8fr]">
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatBlock label="Capacity" value={venue.capacity?.toLocaleString() || 'N/A'} icon={<UsersIcon className="h-5 w-5" />} accent="sky" />
              <StatBlock label="Surface" value={venue.surface || 'Unknown'} icon={<span className="text-xl">🌿</span>} accent="emerald" />
              <StatBlock label="Home teams" value={String(venue.teams.length)} icon={<span className="text-xl">⚽</span>} accent="violet" />
            </div>

            {venue.teams.length > 0 && (
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_rgba(4,10,8,0.8)]">
                <h2 className="mb-5 flex items-center gap-3 text-2xl font-black text-white"><span className="text-3xl">🏠</span>Home teams</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {venue.teams.map((team) => (
                    <Link key={team.id} href={`/teams/${team.id}`} className="group rounded-[22px] border border-white/10 bg-[#0b1d16] p-4 transition hover:border-sky-400/40 hover:bg-[#112922]">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                          {team.logoUrl ? (
                            <Image src={team.logoUrl} alt={team.name} width={56} height={56} className="h-full w-full object-contain" />
                          ) : (
                            <span className="text-xl font-black text-sky-200">{team.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-lg font-bold text-white transition group-hover:text-sky-300">{team.name}</div>
                          {team.country && <div className="mt-1 inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300">{team.country.name}</div>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {venue.country && (
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_rgba(4,10,8,0.8)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Location</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="text-3xl">{venue.country.code === 'GB' ? '🇬🇧' : venue.country.code === 'ES' ? '🇪🇸' : venue.country.code === 'FR' ? '🇫🇷' : venue.country.code === 'DE' ? '🇩🇪' : venue.country.code === 'IT' ? '🇮🇹' : '🏳️'}</div>
                  <div>
                    <div className="text-lg font-bold text-white">{venue.country.name}</div>
                    <div className="text-sm text-slate-400">{venue.country.code}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_rgba(4,10,8,0.8)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Quick facts</p>
              <div className="mt-4 space-y-4 text-sm text-slate-300">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3"><span>Venue</span><span className="font-semibold text-white">{venue.name}</span></div>
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3"><span>City</span><span className="font-semibold text-white">{venue.city || 'Unknown'}</span></div>
                <div className="flex items-center justify-between gap-3"><span>Surface</span><span className="font-semibold text-white">{venue.surface || 'Unknown'}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBlock({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent: 'sky' | 'emerald' | 'violet' }) {
  const accentStyles = {
    sky: 'border-sky-400/30 bg-sky-500/10 text-sky-200',
    emerald: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
    violet: 'border-violet-400/30 bg-violet-500/10 text-violet-200',
  };

  return (
    <div className={`rounded-[24px] border p-5 ${accentStyles[accent]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-slate-300">{label}</p>
          <p className="mt-3 text-2xl font-black text-white">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10">{icon}</div>
      </div>
    </div>
  );
}