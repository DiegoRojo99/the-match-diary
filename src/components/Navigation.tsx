'use client';

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

const PlusIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

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
            <Link
              href="/matches"
              className="text-gray-300 hover:text-green-400 px-3 py-2 text-sm font-semibold transition-colors relative group flex items-center gap-2"
            >
              <MatchIcon />
              <span className="tracking-wide">My Matches</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/stadiums"
              className="text-gray-300 hover:text-green-400 px-3 py-2 text-sm font-semibold transition-colors relative group flex items-center gap-2"
            >
              <StadiumIcon />
              <span className="tracking-wide">Stadiums</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/competitions"
              className="text-gray-300 hover:text-green-400 px-3 py-2 text-sm font-semibold transition-colors relative group flex items-center gap-2"
            >
              <TrophyIcon />
              <span className="tracking-wide">Competitions</span>
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
              href="/add-match"
              className="bg-green-500 hover:bg-green-400 text-black px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25 flex items-center gap-2"
            >
              <PlusIcon />
              <span className="tracking-wide">Add Match</span>
            </Link>
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
              href="/matches"
              className="text-gray-300 hover:text-green-400 hover:bg-gray-900 flex items-center gap-3 px-3 py-3 text-base font-semibold rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <MatchIcon className="w-5 h-5" />
              <span className="tracking-wide">My Matches</span>
            </Link>
            <Link
              href="/stadiums"
              className="text-gray-300 hover:text-green-400 hover:bg-gray-900 flex items-center gap-3 px-3 py-3 text-base font-semibold rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <StadiumIcon className="w-5 h-5" />
              <span className="tracking-wide">Stadiums</span>
            </Link>
            <Link
              href="/competitions"
              className="text-gray-300 hover:text-green-400 hover:bg-gray-900 flex items-center gap-3 px-3 py-3 text-base font-semibold rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <TrophyIcon className="w-5 h-5" />
              <span className="tracking-wide">Competitions</span>
            </Link>
            <Link
              href="/stats"
              className="text-gray-300 hover:text-green-400 hover:bg-gray-900 flex items-center gap-3 px-3 py-3 text-base font-semibold rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <StatsIcon className="w-5 h-5" />
              <span className="tracking-wide">Statistics</span>
            </Link>
            <Link
              href="/add-match"
              className="bg-green-500 hover:bg-green-400 text-black flex items-center gap-3 px-3 py-3 rounded-lg text-base font-bold transition-colors mt-4"
              onClick={() => setIsOpen(false)}
            >
              <PlusIcon className="w-5 h-5" />
              <span className="tracking-wide">Add Match</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}