'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/auth';
import { CombinedMatchResponse, MatchWithDetails } from '@/types/prisma/match';
import { UserMatch } from '@prisma/client';

const ArrowLeftIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const CheckIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const FINISHED_STATUSES = ['FT', 'AET', 'PEN'];
const LIVE_STATUSES = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'];

function getStatusBadge(status: string | null, statusLong: string | null) {
  if (!status) return null;

  if (FINISHED_STATUSES.includes(status)) {
    return (
      <span className="px-3 py-1 bg-gray-800 text-white text-sm font-semibold rounded-full">
        {status}
      </span>
    );
  }

  if (LIVE_STATUSES.includes(status)) {
    return (
      <span className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full animate-pulse">
        LIVE · {status}
      </span>
    );
  }

  return (
    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
      {statusLong ?? status}
    </span>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return {
    full: date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    input: date.toISOString().slice(0, 10),
  };
}

interface LogVisitForm {
  attended_date: string;
  rating: number;
  notes: string;
}

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = params.id as string;
  const { user } = useAuth();

  const [match, setMatch] = useState<CombinedMatchResponse['match'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userVisit, setUserVisit] = useState<CombinedMatchResponse['userVisit'] | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logLoading, setLogLoading] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);
  const [form, setForm] = useState<LogVisitForm>({
    attended_date: '',
    rating: 5,
    notes: '',
  });

  // Reusable function to fetch match and visit data
  const fetchMatchAndVisit = async () => {
    if (!matchId) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      
      // Include auth header if user is logged in
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/users/matches/${matchId}`, {
        headers
      });
      
      if (response.ok) {
        const { match: matchData, userVisit } = await response.json();
        setMatch(matchData);
        
        // Set user visit if user has already logged this match
        setUserVisit(userVisit);
      } else if (response.status === 404) {
        setError('Match not found');
      } else {
        setError('Error loading match details');
      }
    } catch {
      setError('Error loading match details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchAndVisit();
  }, [matchId, user]); // Include user in dependencies so it refetches when auth state changes

  const openLogModal = () => {
    if (match) {
      const defaultDate = userVisit 
        ? formatDate(userVisit.attendedDate.toISOString()).input
        : formatDate(match.matchDate.toISOString()).input;
      
      setForm((prev) => ({
        ...prev,
        attended_date: defaultDate,
        rating: userVisit?.rating ?? 5,
        notes: userVisit?.notes ?? '',
      }));
    }
    setLogError(null);
    setShowLogModal(true);
  };

  const handleLogVisit = async () => {
    if (!user || !match) return;
    setLogLoading(true);
    setLogError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLogError('You must be signed in to log a visit.');
        return;
      }

      const body = {
        match_id: match.id,
        attended_date: form.attended_date || undefined,
        rating: form.rating || undefined,
        notes: form.notes || undefined,
      };

      const response = await fetch('/api/user/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        setShowLogModal(false);
        // Refetch the combined data to get the updated visit info
        await fetchMatchAndVisit();
      } else {
        const data = await response.json();
        setLogError(data.error ?? 'Failed to log visit');
      }
    } catch {
      setLogError('Failed to log visit');
    } finally {
      setLogLoading(false);
    }
  };

  const handleRemoveVisit = async () => {
    if (!userVisit) return;
    setLogLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/user/matches/${userVisit.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.ok) {
        // Refetch the combined data to reflect the removed visit
        await fetchMatchAndVisit();
      }
    } catch {
      // ignore
    } finally {
      setLogLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-green-600"></div>
          <span className="text-gray-600 font-medium text-lg">Loading match details...</span>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚽</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              {error ?? 'Match not found'}
            </h3>
            <p className="text-gray-500 mb-6">
              The match you&apos;re looking for doesn&apos;t exist or there was an error loading it.
            </p>
            <Link
              href="/"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isFinished = match.statusShort !== null && FINISHED_STATUSES.includes(match.statusShort);
  const isLive = match.statusShort !== null && LIVE_STATUSES.includes(match.statusShort);
  const matchDate = formatDate(match.matchDate.toISOString());

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">

        {/* Back button + Log Visit button */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm font-medium"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Link>

          {user && (
            userVisit ? (
              <button
                onClick={handleRemoveVisit}
                disabled={logLoading}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-red-600 transition-all duration-200 shadow-sm font-medium gap-2 disabled:opacity-50"
                title="Click to remove visit"
              >
                <CheckIcon className="w-4 h-4" />
                Visited
              </button>
            ) : (
              <button
                onClick={openLogModal}
                disabled={logLoading}
                className="inline-flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-400 hover:text-green-700 transition-all duration-200 shadow-sm font-medium gap-2 disabled:opacity-50"
              >
                <span className="text-lg leading-none">📋</span>
                Log as Visited
              </button>
            )
          )}
        </div>

        {/* Competition & Round Header */}
        {match.competition && (
          <div className="flex items-center justify-center space-x-3 mb-6">
            {match.competition.logoUrl && (
              <img
                src={match.competition.logoUrl}
                alt={match.competition.name}
                className="w-8 h-8 object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
            <span className="text-gray-600 font-medium">
              {match.competition.name}
              {match.matchWeek && (
                <>
                  <span className="mx-2 text-gray-400">·</span>
                  Round {match.matchWeek}
                </>
              )}
              <>
                <span className="mx-2 text-gray-400">·</span>
                {match.seasonYear}
              </>
            </span>
          </div>
        )}

        {/* Match Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6">

          {/* Status Badge */}
          <div className="flex justify-center mb-6">
            {getStatusBadge(match.statusShort, match.statusLong)}
          </div>

          {/* Teams & Score */}
          <div className="flex items-center justify-between gap-4">

            {/* Home Team */}
            <div className="flex-1 flex flex-col items-center text-center">
              {match.homeTeam?.logoUrl ? (
                <img
                  src={match.homeTeam.logoUrl}
                  alt={match.homeTeam.name}
                  className="w-20 h-20 object-contain mb-3"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-3xl font-bold text-gray-400">
                    {match.homeTeam?.name?.charAt(0) ?? '?'}
                  </span>
                </div>
              )}
              {match.homeTeam ? (
                <Link
                  href={`/teams/${match.homeTeam.id}`}
                  className="text-xl font-bold text-gray-900 hover:text-green-600 transition-colors"
                >
                  {match.homeTeam.name}
                </Link>
              ) : (
                <span className="text-xl font-bold text-gray-400">TBD</span>
              )}
              <span className="text-sm text-gray-400 mt-1">Home</span>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center min-w-[140px]">
              {(isFinished || isLive) && match.homeScore !== null && match.awayScore !== null ? (
                <div className="text-5xl font-extrabold text-gray-900 tracking-wider">
                  {match.homeScore}
                  <span className="mx-3 text-gray-400">-</span>
                  {match.awayScore}
                </div>
              ) : (
                <div className="text-3xl font-bold text-gray-400">vs</div>
              )}
              <div className="mt-3 text-sm text-gray-500">{matchDate.time}</div>
            </div>

            {/* Away Team */}
            <div className="flex-1 flex flex-col items-center text-center">
              {match.awayTeam?.logoUrl ? (
                <img
                  src={match.awayTeam.logoUrl}
                  alt={match.awayTeam.name}
                  className="w-20 h-20 object-contain mb-3"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-3xl font-bold text-gray-400">
                    {match.awayTeam?.name?.charAt(0) ?? '?'}
                  </span>
                </div>
              )}
              {match.awayTeam ? (
                <Link
                  href={`/teams/${match.awayTeam.id}`}
                  className="text-xl font-bold text-gray-900 hover:text-green-600 transition-colors"
                >
                  {match.awayTeam.name}
                </Link>
              ) : (
                <span className="text-xl font-bold text-gray-400">TBD</span>
              )}
              <span className="text-sm text-gray-400 mt-1">Away</span>
            </div>

          </div>
        </div>

        {/* Match Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Date & Time */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Date &amp; Time
            </h3>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">📅</span>
              <div>
                <p className="font-semibold text-gray-900">{matchDate.full}</p>
                <p className="text-gray-500 mt-1">
                  <span className="text-lg">⏰</span> {matchDate.time}
                </p>
              </div>
            </div>
          </div>

          {/* Venue */}
          {match.venue ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Venue
              </h3>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🏟️</span>
                <div>
                  <Link
                    href={`/venues/${match.venue.id}`}
                    className="font-semibold text-gray-900 hover:text-green-600 transition-colors"
                  >
                    {match.venue.name}
                  </Link>
                  {match.venue.capacity && (
                    <p className="text-sm text-gray-400 mt-1">
                      Capacity: {match.venue.capacity.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Venue
              </h3>
              <div className="flex items-center space-x-3 text-gray-400">
                <span className="text-2xl">🏟️</span>
                <span>No venue information available</span>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Log Visit Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Log Match Visit</h2>
            <p className="text-sm text-gray-500 mb-5">
              {match.homeTeam?.name ?? 'Home'} vs {match.awayTeam?.name ?? 'Away'}
            </p>

            <div className="space-y-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Attended</label>
                <input
                  type="date"
                  value={form.attended_date}
                  onChange={(e) => setForm({ ...form, attended_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                />
              </div>

              {/* Rating Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating: {form.rating}/10
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) })}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: 'linear-gradient(to right, #ef4444 0%, #f59e0b 30%, #10b981 60%, #3b82f6 100%)'
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 px-1">
                    <span className="text-red-500">Poor</span>
                    <span className="text-yellow-500">Average</span>
                    <span className="text-green-500">Good</span>
                    <span className="text-blue-500">Excellent</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Your memories about this match..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 resize-none"
                />
              </div>

              {logError && (
                <p className="text-sm text-red-600">{logError}</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLogModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleLogVisit}
                disabled={logLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
              >
                {logLoading ? 'Saving...' : 'Save Visit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
