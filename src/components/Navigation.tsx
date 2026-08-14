'use client';

import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { useState } from 'react';

const StadiumIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const BookmarkIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const LocationIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SignInIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  </svg>
);

const SignOutIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export default function Navigation() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    setLoading(false);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#06130d]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-xl shadow-[0_0_30px_rgba(56,211,159,0.25)] transition-transform duration-200 group-hover:scale-105">
              ⚽
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-white">The Match Diary</div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-emerald-300/80">Football Journal</div>
            </div>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            {user ? (
              <>
                <NavLink href="/dashboard" icon={<BookmarkIcon />} label="Dashboard" />
                <NavLink href="/discover" icon={<StadiumIcon />} label="Discover" />
                <NavLink href="/my-matches" icon={<BookmarkIcon />} label="My Matches" />
                <NavLink href="/venues" icon={<LocationIcon />} label="Venues" />
                <NavLink href="/teams" icon={<StadiumIcon />} label="Teams" />

                <div className="ml-3 flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-xs font-black text-[#062217]">
                    {user.user_metadata?.display_name?.[0]?.toUpperCase() ||
                      user.user_metadata?.username?.[0]?.toUpperCase() ||
                      user.email?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-200">
                    {user.user_metadata?.display_name || user.user_metadata?.username || user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    disabled={loading}
                    className="ml-2 flex items-center gap-2 rounded-full border border-white/10 bg-transparent px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-red-400/50 hover:text-red-300 disabled:opacity-50"
                  >
                    <SignOutIcon className="w-3.5 h-3.5" />
                    {loading ? 'Signing out...' : 'Sign out'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <NavLink href="/auth/login" icon={<SignInIcon />} label="Sign in" />
                <Link
                  href="/auth/register"
                  className="ml-2 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 px-5 py-2.5 text-sm font-bold text-[#052814] shadow-[0_12px_35px_rgba(56,211,159,0.35)] transition hover:brightness-110"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:border-emerald-400/40 hover:text-emerald-300"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-white/10 bg-[#06130d] lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4">
            {user && (
              <>
                <NavLink href="/dashboard" icon={<BookmarkIcon />} label="Dashboard" mobile onClick={() => setIsOpen(false)} />
                <NavLink href="/discover" icon={<StadiumIcon />} label="Discover" mobile onClick={() => setIsOpen(false)} />
                <NavLink href="/my-matches" icon={<BookmarkIcon />} label="My Matches" mobile onClick={() => setIsOpen(false)} />
              </>
            )}
            <NavLink href="/venues" icon={<LocationIcon />} label="Venues" mobile onClick={() => setIsOpen(false)} />
            <NavLink href="/teams" icon={<StadiumIcon />} label="Teams" mobile onClick={() => setIsOpen(false)} />

            {user ? (
              <>
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 font-bold text-[#062217]">
                    {user.user_metadata?.display_name?.[0]?.toUpperCase() ||
                      user.user_metadata?.username?.[0]?.toUpperCase() ||
                      user.email?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {user.user_metadata?.display_name || user.user_metadata?.username || user.email}
                    </p>
                    <p className="truncate text-xs text-slate-400">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="mt-2 flex items-center justify-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 disabled:opacity-50"
                >
                  <SignOutIcon className="h-4 w-4" />
                  {loading ? 'Signing out...' : 'Sign out'}
                </button>
              </>
            ) : (
              <>
                <NavLink href="/auth/login" icon={<SignInIcon />} label="Sign in" mobile onClick={() => setIsOpen(false)} />
                <Link
                  href="/auth/register"
                  onClick={() => setIsOpen(false)}
                  className="mt-2 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 px-4 py-3 text-sm font-bold text-[#062217]"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({
  href,
  icon,
  label,
  mobile = false,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  mobile?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={
        mobile
          ? 'flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/40 hover:text-emerald-300'
          : 'inline-flex items-center gap-2 rounded-full border border-transparent px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/30 hover:bg-emerald-500/5 hover:text-emerald-300'
      }
    >
      <span className="shrink-0">{icon}</span>
      {label}
    </Link>
  );
}
