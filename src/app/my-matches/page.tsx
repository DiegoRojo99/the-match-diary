'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/auth';
import { UserMatchWithMatch } from '@/types/prisma/match';

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

export default function MyMatchesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [visits, setVisits] = useState<UserMatchWithMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchVisits = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      try {
        const response = await fetch('/api/user/matches', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setVisits(data);
        }
      } catch (error) {
        console.error('Error fetching visits:', error);
      } finally {
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

      if (response.ok) {
        setVisits((prev) => prev.filter((v) => v.id !== visitId));
      }
    } catch (error) {
      console.error('Error deleting visit:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
          <span className="text-gray-600 font-medium text-lg">Loading your matches...</span>
        </div>
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
            {visits.map((visit) => {
              const m = visit.match;
              const isFinished = m?.statusShort ? FINISHED_STATUSES.includes(m.statusShort) : false;
              const attendedDate = new Date(visit.attendedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={visit.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
                >
                  {/* Teams & Score */}
                  <Link href={`/matches/${visit.matchId}`} className="block group">
                    <div className="flex items-center justify-between gap-2">
                      {/* Home team */}
                      <div className="flex-1 flex flex-col items-center text-center">
                        {m?.homeTeam?.logoUrl ? (
                          <img
                            src={m.homeTeam.logoUrl}
                            alt={m.homeTeam.name}
                            className="w-12 h-12 object-contain mb-1"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                            <span className="text-lg font-bold text-gray-400">
                              {m?.homeTeam?.name?.charAt(0) ?? '?'}
                            </span>
                          </div>
                        )}
                        <span className="text-sm font-semibold text-gray-800 group-hover:text-green-600 transition-colors line-clamp-2">
                          {m?.homeTeam?.name ?? 'Home'}
                        </span>
                      </div>

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
                      <div className="flex-1 flex flex-col items-center text-center">
                        {m?.awayTeam?.logoUrl ? (
                          <img
                            src={m.awayTeam.logoUrl}
                            alt={m.awayTeam.name}
                            className="w-12 h-12 object-contain mb-1"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                            <span className="text-lg font-bold text-gray-400">
                              {m?.awayTeam?.name?.charAt(0) ?? '?'}
                            </span>
                          </div>
                        )}
                        <span className="text-sm font-semibold text-gray-800 group-hover:text-green-600 transition-colors line-clamp-2">
                          {m?.awayTeam?.name ?? 'Away'}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Metadata */}
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

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <Link
                      href={`/matches/${visit.matchId}`}
                      className="flex-1 text-center px-3 py-1.5 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      View Match
                    </Link>
                    <button
                      onClick={() => handleDelete(visit.id)}
                      disabled={deletingId === visit.id}
                      className="px-3 py-1.5 text-sm border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
                    >
                      {deletingId === visit.id ? '...' : 'Remove'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
