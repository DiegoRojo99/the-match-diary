'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import FootballLoader from '@/components/FootballLoader';
import { CompetitionWithCountry } from '@/lib/prisma';
import CompetitionHeader from './sections/CompetitionHeader';
import CompetitionMatches from './sections/CompetitionMatches';

export default function CompetitionDetailPage() {
  const params = useParams();
  const competitionId = params.id as string;

  const [competition, setCompetition] = useState<CompetitionWithCountry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!competitionId) return;

    const fetchCompetition = async () => {
      try {
        const res = await fetch(`/api/competitions/${competitionId}`);
        if (res.ok) {
          const data = await res.json();
          setCompetition(data);
        } else {
          setError('Competition not found');
        }
      } catch (err) {
        console.error('Error fetching competition:', err);
        setError('Error loading competition details');
      } finally {
        setLoading(false);
      }
    };

    fetchCompetition();
  }, [competitionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
          <FootballLoader size="xl" text="Loading competition details..." />
        </div>
      </div>
    );
  }

  if (error || !competition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😞</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              {error ?? 'Competition not found'}
            </h3>
            <a
              href="/competitions"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Back to Competitions
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <CompetitionHeader competition={competition} />
        <CompetitionMatches competition={competition} />
      </div>
    </div>
  );
}
