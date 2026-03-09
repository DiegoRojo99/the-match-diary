'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/auth';
import type { MatchDetailResponse } from '@/app/api/matches/[id]/route';

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
  rating: string;
  notes: string;
  seat_section: string;
  ticket_price: string;
  currency: string;
  weather: string;
}

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = params.id as string;
  const { user } = useAuth();

  const [match, setMatch] = useState<MatchDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [visitId, setVisitId] = useState<string | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logLoading, setLogLoading] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);
  const [form, setForm] = useState<LogVisitForm>({
    attended_date: '',
    rating: '',
    notes: '',
    seat_section: '',
    ticket_price: '',
    currency: 'EUR',
    weather: '',
  });

  useEffect(() => {
    const fetchMatch = async () => {
      if (!matchId) return;
      try {
        const response = await fetch(`/api/matches/${matchId}`);
        if (response.ok) {
          const data = await response.json();
          setMatch(data);
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

    fetchMatch();
  }, [matchId]);

  // Check if this match is already logged by the user
  useEffect(() => {
    if (!user || !matchId) return;

    const checkVisit = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      try {
        const response = await fetch('/api/user/matches', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (response.ok) {
          const visits = await response.json();
          const existing = visits.find((v: { match_id: number; id: string }) => v.match_id === parseInt(matchId));
          if (existing) setVisitId(existing.id);
        }
      } catch {
        // ignore
      }
    };

    checkVisit();
  }, [user, matchId]);

  const openLogModal = () => {
    if (match) {
      setForm((prev) => ({
        ...prev,
        attended_date: formatDate(match.match_date).input,
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
        rating: form.rating ? parseInt(form.rating) : undefined,
        notes: form.notes || undefined,
        seat_section: form.seat_section || undefined,
        ticket_price: form.ticket_price ? parseFloat(form.ticket_price) : undefined,
        currency: form.currency || 'EUR',
        weather: form.weather || undefined,
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
        setVisitId(data.id);
        setShowLogModal(false);
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
    if (!visitId) return;
    setLogLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/user/matches/${visitId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.ok) {
        setVisitId(null);
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

  const isFinished = match.status !== null && FINISHED_STATUSES.includes(match.status);
  const isLive = match.status !== null && LIVE_STATUSES.includes(match.status);
  const matchDate = formatDate(match.match_date);

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
            visitId ? (
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
            {match.competition.logo && (
              <img
                src={match.competition.logo}
                alt={match.competition.name}
                className="w-8 h-8 object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
            <span className="text-gray-600 font-medium">
              {match.competition.name}
              {match.round && (
                <>
                  <span className="mx-2 text-gray-400">·</span>
                  {match.round}
                </>
              )}
              {match.season && (
                <>
                  <span className="mx-2 text-gray-400">·</span>
                  {match.season}
                </>
              )}
            </span>
          </div>
        )}

        {/* Match Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6">

          {/* Status Badge */}
          <div className="flex justify-center mb-6">
            {getStatusBadge(match.status, match.status_long)}
          </div>

          {/* Teams & Score */}
          <div className="flex items-center justify-between gap-4">

            {/* Home Team */}
            <div className="flex-1 flex flex-col items-center text-center">
              {match.home_team?.logo ? (
                <img
                  src={match.home_team.logo}
                  alt={match.home_team.name}
                  className="w-20 h-20 object-contain mb-3"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-3xl font-bold text-gray-400">
                    {match.home_team?.name?.charAt(0) ?? '?'}
                  </span>
                </div>
              )}
              {match.home_team ? (
                <Link
                  href={`/teams/${match.home_team.id}`}
                  className="text-xl font-bold text-gray-900 hover:text-green-600 transition-colors"
                >
                  {match.home_team.name}
                </Link>
              ) : (
                <span className="text-xl font-bold text-gray-400">TBD</span>
              )}
              <span className="text-sm text-gray-400 mt-1">Home</span>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center min-w-[140px]">
              {(isFinished || isLive) && match.home_score !== null && match.away_score !== null ? (
                <div className="text-5xl font-extrabold text-gray-900 tracking-wider">
                  {match.home_score}
                  <span className="mx-3 text-gray-400">-</span>
                  {match.away_score}
                </div>
              ) : (
                <div className="text-3xl font-bold text-gray-400">vs</div>
              )}
              <div className="mt-3 text-sm text-gray-500">{matchDate.time}</div>
            </div>

            {/* Away Team */}
            <div className="flex-1 flex flex-col items-center text-center">
              {match.away_team?.logo ? (
                <img
                  src={match.away_team.logo}
                  alt={match.away_team.name}
                  className="w-20 h-20 object-contain mb-3"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-3xl font-bold text-gray-400">
                    {match.away_team?.name?.charAt(0) ?? '?'}
                  </span>
                </div>
              )}
              {match.away_team ? (
                <Link
                  href={`/teams/${match.away_team.id}`}
                  className="text-xl font-bold text-gray-900 hover:text-green-600 transition-colors"
                >
                  {match.away_team.name}
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
                  {match.venue.city && (
                    <p className="text-gray-500 mt-1">{match.venue.city}</p>
                  )}
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
              {match.home_team?.name ?? 'Home'} vs {match.away_team?.name ?? 'Away'}
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

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1–5)</label>
                <select
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                >
                  <option value="">No rating</option>
                  <option value="1">⭐ 1</option>
                  <option value="2">⭐⭐ 2</option>
                  <option value="3">⭐⭐⭐ 3</option>
                  <option value="4">⭐⭐⭐⭐ 4</option>
                  <option value="5">⭐⭐⭐⭐⭐ 5</option>
                </select>
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

              {/* Seat Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seat Section</label>
                <input
                  type="text"
                  value={form.seat_section}
                  onChange={(e) => setForm({ ...form, seat_section: e.target.value })}
                  placeholder="e.g. North Stand, Block A"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                />
              </div>

              {/* Ticket Price & Currency */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.ticket_price}
                    onChange={(e) => setForm({ ...form, ticket_price: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                  >
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              {/* Weather */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weather</label>
                <input
                  type="text"
                  value={form.weather}
                  onChange={(e) => setForm({ ...form, weather: e.target.value })}
                  placeholder="e.g. Sunny, Rainy, Cold"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
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
