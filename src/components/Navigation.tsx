'use client';

import Link from 'next/link';
import { useState } from 'react';

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
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            <Link
              href="/matches"
              className="text-gray-300 hover:text-green-400 px-3 py-2 text-sm font-medium transition-colors relative group"
            >
              My Matches
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/stadiums"
              className="text-gray-300 hover:text-green-400 px-3 py-2 text-sm font-medium transition-colors relative group"
            >
              Stadiums
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/competitions"
              className="text-gray-300 hover:text-green-400 px-3 py-2 text-sm font-medium transition-colors relative group"
            >
              Competitions
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/stats"
              className="text-gray-300 hover:text-green-400 px-3 py-2 text-sm font-medium transition-colors relative group"
            >
              Statistics
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/add-match"
              className="bg-green-500 hover:bg-green-400 text-black px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25"
            >
              + Add Match
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
              className="text-gray-300 hover:text-green-400 hover:bg-gray-900 block px-3 py-3 text-base font-medium rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              My Matches
            </Link>
            <Link
              href="/stadiums"
              className="text-gray-300 hover:text-green-400 hover:bg-gray-900 block px-3 py-3 text-base font-medium rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Stadiums
            </Link>
            <Link
              href="/competitions"
              className="text-gray-300 hover:text-green-400 hover:bg-gray-900 block px-3 py-3 text-base font-medium rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Competitions
            </Link>
            <Link
              href="/stats"
              className="text-gray-300 hover:text-green-400 hover:bg-gray-900 block px-3 py-3 text-base font-medium rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Statistics
            </Link>
            <Link
              href="/add-match"
              className="bg-green-500 hover:bg-green-400 text-black block px-3 py-3 rounded-lg text-base font-bold transition-colors mt-4"
              onClick={() => setIsOpen(false)}
            >
              + Add Match
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}