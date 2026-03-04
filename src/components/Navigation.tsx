'use client';

import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { useState } from 'react';

// Icon components
const MatchIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const StadiumIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const LocationIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const TrophyIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const StatsIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const AdminIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const PlusIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const SignInIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  </svg>
);

const SignOutIcon = ({ className = "w-4 h-4" }) => (
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
    <nav className="bg-black border-b border-gray-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <span className="text-3xl group-hover:scale-110 transition-transform">⚽</span>
              <span className="ml-3 text-xl font-bold text-white group-hover:text-green-400 transition-colors">
                The Match Diary
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6">
            {user ? (
              <>
                <Link
                  href="/matches"
                  className="text-gray-300 hover:text-green-400 px-3 py-2 text-sm font-semibold transition-colors relative group flex items-center gap-2"
                >
                  <MatchIcon />
                  <span className="tracking-wide">My Matches</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 transition-all group-hover:w-full" />
                </Link>
                <Link
                  href="/venues"
                  className="text-gray-300 hover:text-green-400 px-3 py-2 text-sm font-semibold transition-colors relative group flex items-center gap-2"
                >
                  <LocationIcon />
                  <span className="tracking-wide">Venues</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 transition-all group-hover:w-full" />
                </Link>
                <Link
                  href="/teams"
                  className="text-gray-300 hover:text-green-400 px-3 py-2 text-sm font-semibold transition-colors relative group flex items-center gap-2"
                >
                  <StadiumIcon />
                  <span className="tracking-wide">Teams</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 transition-all group-hover:w-full" />
                </Link>
                <Link
                  href="/stats"
                  className="text-gray-300 hover:text-green-400 px-3 py-2 text-sm font-semibold transition-colors relative group flex items-center gap-2"
                >
                  <StatsIcon />
                  <span className="tracking-wide">Statistics</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 transition-all group-hover:w-full" />
                </Link>
                <Link
                  href="/admin/competitions"
                  className="text-gray-300 hover:text-yellow-400 px-3 py-2 text-sm font-semibold transition-colors relative group flex items-center gap-2"
                >
                  <AdminIcon />
                  <span className="tracking-wide">Admin</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 transition-all group-hover:w-full" />
                </Link>
                <Link
                  href="/add-match"
                  className="bg-green-500 hover:bg-green-400 text-black px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25 flex items-center gap-2"
                >
                  <PlusIcon />
                  <span className="tracking-wide">Add Match</span>
                </Link>
                
                {/* User Menu */}
                <div className="flex items-center space-x-3 ml-4 border-l border-gray-700 pl-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-black font-medium text-sm">
                        {user.user_metadata?.display_name?.[0]?.toUpperCase() || 
                         user.user_metadata?.username?.[0]?.toUpperCase() || 
                         user.email?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-300 text-sm">
                      {user.user_metadata?.display_name || 
                       user.user_metadata?.username || 
                       user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    disabled={loading}
                    className="flex items-center space-x-1 text-gray-300 hover:text-red-400 transition-colors font-medium disabled:opacity-50 px-2 py-1"
                  >
                    <SignOutIcon />
                    <span className="text-sm">{loading ? 'Signing out...' : 'Sign out'}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/auth/login"
                  className="flex items-center space-x-1 text-gray-300 hover:text-green-400 transition-colors font-medium px-3 py-2"
                >
                  <SignInIcon />
                  <span className="tracking-wide">Sign in</span>
                </Link>
                <Link 
                  href="/auth/register"
                  className="bg-green-500 text-black px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-green-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-green-400 hover:bg-gray-900 transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black">
            <Link
              href="/venues"
              className="text-gray-300 hover:text-green-400 hover:bg-gray-900 flex items-center gap-3 px-3 py-3 text-base font-semibold rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <LocationIcon className="w-5 h-5" />
              <span className="tracking-wide">Venues</span>
            </Link>

            <Link
              href="/teams"
              className="text-gray-300 hover:text-green-400 hover:bg-gray-900 flex items-center gap-3 px-3 py-3 text-base font-semibold rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <StadiumIcon className="w-5 h-5" />
              <span className="tracking-wide">Teams</span>
            </Link>
            
            <Link
              href="/admin/competitions"
              className="text-gray-300 hover:text-yellow-400 hover:bg-gray-900 flex items-center gap-3 px-3 py-3 text-base font-semibold rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <AdminIcon className="w-5 h-5" />
              <span className="tracking-wide">Admin</span>
            </Link>
            
            <Link
              href="/add-match"
              className="bg-green-500 hover:bg-green-400 text-black flex items-center gap-3 px-3 py-3 rounded-lg text-base font-bold transition-colors mt-4"
              onClick={() => setIsOpen(false)}
            >
              <PlusIcon className="w-5 h-5" />
              <span className="tracking-wide">Add Match</span>
            </Link>
            {user ? (
              <>
                {/* User info */}
                <div className="flex items-center space-x-3 px-3 py-3 border-b border-gray-700 mb-2">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-black font-medium">
                      {user.user_metadata?.display_name?.[0]?.toUpperCase() || 
                       user.user_metadata?.username?.[0]?.toUpperCase() || 
                       user.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      {user.user_metadata?.display_name || user.user_metadata?.username || user.email}
                    </p>
                    <p className="text-gray-400 text-xs">{user.email}</p>
                  </div>
                </div>
                
                {/* Sign out button */}
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="w-full text-gray-300 hover:text-red-400 hover:bg-gray-900 flex items-center gap-3 px-3 py-3 text-base font-semibold rounded-lg transition-colors mt-2 disabled:opacity-50"
                >
                  <SignOutIcon className="w-5 h-5" />
                  <span className="tracking-wide">{loading ? 'Signing out...' : 'Sign out'}</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-300 hover:text-green-400 hover:bg-gray-900 flex items-center gap-3 px-3 py-3 text-base font-semibold rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <SignInIcon className="w-5 h-5" />
                  <span className="tracking-wide">Sign in</span>
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-green-500 hover:bg-green-400 text-black flex items-center justify-center px-3 py-3 rounded-lg text-base font-bold transition-colors mt-4"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="tracking-wide">Sign up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}