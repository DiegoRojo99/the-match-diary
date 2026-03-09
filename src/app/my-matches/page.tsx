'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/auth';
import { UserMatchWithMatch } from '@/types/prisma/match';
import FootballLoader from '@/components/FootballLoader';
import VisitCard from './VisitCard';

export default function MyMatchesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [visits, setVisits] = useState<UserMatchWithMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchVisits = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      try {
        const responseData = await fetch('/api/user/matches', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }).then((res) => {
          if (!res.ok) throw new Error('Failed to fetch visits');
          return res.json();
        });

        setVisits(responseData);
      } 
      catch (error) {
        console.error('Error fetching visits:', error);
      } 
      finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, [user]);

  const handleDelete = async (visitId: string) => {
    setDeletingId(visitId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/user/matches/${visitId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.ok) setVisits((prev) => prev.filter((v) => v.id !== visitId));
    } 
    catch (error) {
      console.error('Error deleting visit:', error);
    } 
    finally {
      setDeletingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 flex items-center justify-center">
        <FootballLoader size="xl" text="Loading your matches..." />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Matches</h1>
          <p className="text-gray-500">
            {visits.length === 0
              ? 'You haven\'t logged any match visits yet.'
              : `You have visited ${visits.length} match${visits.length !== 1 ? 'es' : ''}.`}
          </p>
        </div>

        {visits.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="text-8xl mb-6">⚽</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No matches logged yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Start logging the matches you attend! Browse matches and click &ldquo;Log as Visited&rdquo; on the match details page.
            </p>
            <Link
              href="/"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Browse Matches
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {visits.map((visit) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                onDelete={handleDelete}
                deletingId={deletingId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
