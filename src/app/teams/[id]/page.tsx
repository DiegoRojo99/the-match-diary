'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TeamHeader from './sections/TeamHeader';
import TeamMatches from './sections/TeamMatches';
import FootballLoader from '@/components/FootballLoader';
import { TeamWithVenue } from '@/lib/prisma';

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.id as string;

  const [team, setTeam] = useState<TeamWithVenue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!teamId) return;

      try {
        const response = await fetch(`/api/teams/${teamId}`);
        if (response.ok) {
          const data = await response.json();
          setTeam(data);
        } else {
          setError('Team not found');
        }
      } catch (error) {
        console.error('Error fetching team:', error);
        setError('Error loading team details');
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [teamId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05150f]">
        <FootballLoader size="xl" text="Loading team details..." />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-[#05150f] text-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <div className="mb-6 text-7xl">😞</div>
          <h3 className="text-3xl font-black text-white">{error || 'Team not found'}</h3>
          <p className="mt-3 text-slate-400">The team you&apos;re looking for doesn&apos;t exist or there was an issue loading it.</p>
          <Link href="/teams" className="mt-8 inline-flex rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 px-6 py-3 text-sm font-black text-[#052814] shadow-[0_18px_40px_rgba(16,185,129,0.35)]">
            Back to teams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05150f] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <TeamHeader team={team} />

        <TeamMatches team={team} />
      </div>
    </div>
  );
}
