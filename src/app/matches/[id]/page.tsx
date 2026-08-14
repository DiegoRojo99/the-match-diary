'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/auth';
import { CombinedMatchResponse } from '@/types/prisma/match';
import FootballLoader from '@/components/FootballLoader';

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
    return <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-200">{status}</span>;
  }

  if (LIVE_STATUSES.includes(status)) {
    return <span className="rounded-full border border-red-400/40 bg-red-500/10 px-3 py-1 text-sm font-semibold text-red-200 animate-pulse">LIVE · {status}</span>;
  }

  return <span className="rounded-full border border-sky-400/40 bg-sky-500/10 px-3 py-1 text-sm font-semibold text-sky-200">{statusLong ?? status}</span>;
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

  const fetchMatchAndVisit = useCallback(async () => {
    if (!matchId) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};

      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/users/matches/${matchId}`, { headers });

      if (response.ok) {
        const { match: matchData, userVisit } = await response.json();
        setMatch(matchData);
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
  }, [matchId]);

  useEffect(() => {
    fetchMatchAndVisit();
  }, [fetchMatchAndVisit]);

  const openLogModal = () => {
    if (match) {
      const defaultDate = userVisit ? formatDate(userVisit.attendedDate).input : formatDate(match.matchDate).input;

      setForm({
        attended_date: defaultDate,
        rating: userVisit?.rating ?? 5,
        notes: userVisit?.notes ?? '',
      });
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
        setShowLogModal(false);
        await fetchMatchAndVisit();
      } 
      else {
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

      if (response.ok) await fetchMatchAndVisit();
    } 
    catch { /* ignore */ } 
    finally { setLogLoading(false); }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05150f]">
        <FootballLoader size="xl" text="Loading match details..." />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-[#05150f] text-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <div className="mb-6 text-7xl">⚽</div>
          <h3 className="text-3xl font-black text-white">{error ?? 'Match not found'}</h3>
          <p className="mt-3 text-slate-400">The match you&apos;re looking for doesn&apos;t exist or couldn&apos;t be loaded.</p>
          <Link href="/" className="mt-8 inline-flex rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 px-6 py-3 text-sm font-black text-[#052814] shadow-[0_18px_40px_rgba(16,185,129,0.35)]">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  const isFinished = match.statusShort !== null && FINISHED_STATUSES.includes(match.statusShort);
  const isLive = match.statusShort !== null && LIVE_STATUSES.includes(match.statusShort);
  const matchDate = formatDate(match.matchDate);

  return (
    <div className="min-h-screen bg-[#05150f] text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/40 hover:text-emerald-300">
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </Link>

          {user && (
            userVisit ? (
              <button onClick={handleRemoveVisit} disabled={logLoading} className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-[#052814] disabled:opacity-60">
                <CheckIcon className="h-4 w-4" />
                Visited
              </button>
            ) : (
              <button onClick={openLogModal} disabled={logLoading} className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20 disabled:opacity-60">
                <span className="text-base">📋</span>
                Log as Visited
              </button>
            )
          )}
        </div>

        {match.competition && (
          <div className="mb-6 flex items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            {match.competition.logoUrl && (
              <Image
                src={match.competition.logoUrl}
                alt={match.competition.name}
                width={28}
                height={28}
                unoptimized
                className="h-7 w-7 object-contain"
              />
            )}
            <span>
              {match.competition.name}
              {match.matchWeek && <><span className="mx-2 text-slate-500">·</span>Round {match.matchWeek}</>}
              <span className="mx-2 text-slate-500">·</span>
              {match.seasonYear}
            </span>
          </div>
        )}

        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),transparent_35%),linear-gradient(135deg,#081a12,#0d2a1d_42%,#06140d)] p-6 shadow-[0_30px_80px_rgba(4,10,8,0.8)] md:p-8">
          <div className="mb-6 flex justify-center">{getStatusBadge(match.statusShort, match.statusLong)}</div>

          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
            <div className="flex flex-col items-center text-center">
              {match.homeTeam?.logoUrl ? (
                <div className="mb-4 overflow-hidden rounded-full border border-white/10 bg-white/5 p-3">
                  <Image src={match.homeTeam.logoUrl} alt={match.homeTeam.name} width={72} height={72} unoptimized className="h-16 w-16 object-contain md:h-20 md:w-20" />
                </div>
              ) : (
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 text-3xl font-black text-slate-300 md:h-24 md:w-24">
                  {match.homeTeam?.name?.charAt(0) ?? '?'}
                </div>
              )}
              {match.homeTeam ? (
                <Link href={`/teams/${match.homeTeam.id}`} className="text-xl font-black text-white transition hover:text-emerald-300">{match.homeTeam.name}</Link>
              ) : (
                <span className="text-xl font-black text-slate-400">TBD</span>
              )}
              <span className="mt-2 text-xs uppercase tracking-[0.25em] text-slate-400">Home</span>
            </div>

            <div className="flex min-w-[130px] flex-col items-center">
              {(isFinished || isLive) && match.homeScore !== null && match.awayScore !== null ? (
                <div className="text-5xl font-black tracking-tight text-white md:text-6xl">
                  {match.homeScore}
                  <span className="mx-3 text-slate-500">-</span>
                  {match.awayScore}
                </div>
              ) : (
                <div className="text-3xl font-black text-slate-400">vs</div>
              )}
              <div className="mt-3 text-sm text-slate-300">{matchDate.time}</div>
            </div>

            <div className="flex flex-col items-center text-center">
              {match.awayTeam?.logoUrl ? (
                <div className="mb-4 overflow-hidden rounded-full border border-white/10 bg-white/5 p-3">
                  <Image src={match.awayTeam.logoUrl} alt={match.awayTeam.name} width={72} height={72} unoptimized className="h-16 w-16 object-contain md:h-20 md:w-20" />
                </div>
              ) : (
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 text-3xl font-black text-slate-300 md:h-24 md:w-24">
                  {match.awayTeam?.name?.charAt(0) ?? '?'}
                </div>
              )}
              {match.awayTeam ? (
                <Link href={`/teams/${match.awayTeam.id}`} className="text-xl font-black text-white transition hover:text-emerald-300">{match.awayTeam.name}</Link>
              ) : (
                <span className="text-xl font-black text-slate-400">TBD</span>
              )}
              <span className="mt-2 text-xs uppercase tracking-[0.25em] text-slate-400">Away</span>
            </div>
          </div>
        </div>

        {userVisit && (
          <div className="mt-8 rounded-[24px] border border-emerald-400/20 bg-emerald-500/5 p-6 shadow-[0_24px_60px_rgba(4,10,8,0.5)]">
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-200">Your memory</p>
              {userVisit.rating != null && (
                <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">
                  {userVisit.rating}/10
                </span>
              )}
            </div>
            <div className="text-lg font-bold text-white">
              {userVisit.attendedDate ? formatDate(userVisit.attendedDate).full : matchDate.full}
            </div>
            {userVisit.notes && (
              <p className="mt-3 text-sm leading-7 text-slate-200">“{userVisit.notes}”</p>
            )}
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_rgba(4,10,8,0.5)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Date &amp; time</p>
            <div className="mt-4 flex items-start gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <p className="text-lg font-bold text-white">{matchDate.full}</p>
                <p className="mt-1 text-slate-300">⏰ {matchDate.time}</p>
              </div>
            </div>
          </div>

          {match.venue ? (
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_rgba(4,10,8,0.5)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Venue</p>
              <div className="mt-4 flex items-start gap-3">
                <span className="text-2xl">🏟️</span>
                <div>
                  <Link href={`/venues/${match.venue.id}`} className="text-lg font-bold text-white transition hover:text-emerald-300">{match.venue.name}</Link>
                  {match.venue.capacity && <p className="mt-1 text-slate-300">Capacity: {match.venue.capacity.toLocaleString()}</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 text-slate-300 shadow-[0_24px_60px_rgba(4,10,8,0.5)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Venue</p>
              <div className="mt-4 flex items-center gap-3"><span className="text-2xl">🏟️</span>No venue information available</div>
            </div>
          )}
        </div>
      </div>

      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-[#0d1d18] p-6 shadow-[0_30px_80px_rgba(4,10,8,0.9)]">
            <h2 className="text-2xl font-black text-white">Log match visit</h2>
            <p className="mt-1 text-sm text-slate-400">{match.homeTeam?.name ?? 'Home'} vs {match.awayTeam?.name ?? 'Away'}</p>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Date attended</label>
                <input type="date" value={form.attended_date} onChange={(e) => setForm({ ...form, attended_date: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-[#0b1d16] px-3 py-3 text-white focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Rating: {form.rating}/10</label>
                <input type="range" min="1" max="10" value={form.rating} onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) })} className="w-full accent-emerald-500" />
                <div className="mt-2 flex justify-between text-[11px] uppercase tracking-[0.2em] text-slate-400">
                  <span>poor</span>
                  <span>avg</span>
                  <span>good</span>
                  <span>great</span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Your memories from this match..." className="w-full resize-none rounded-2xl border border-white/10 bg-[#0b1d16] px-3 py-3 text-white placeholder:text-slate-500 focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>

              {logError && <p className="text-sm text-red-300">{logError}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowLogModal(false)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10">Cancel</button>
                <button onClick={handleLogVisit} disabled={logLoading} className="rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 px-4 py-2 text-sm font-black text-[#052814] disabled:opacity-60">{logLoading ? 'Saving...' : 'Save visit'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
