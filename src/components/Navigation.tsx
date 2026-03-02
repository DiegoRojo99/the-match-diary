'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-green-600">⚽</span>
              <span className="ml-2 text-xl font-semibold text-gray-800 dark:text-white">
                The Match Diary
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link
              href="/matches"
              className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 px-3 py-2 text-sm font-medium"
            >
              My Matches
            </Link>
            <Link
              href="/stadiums"
              className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 px-3 py-2 text-sm font-medium"
            >
              Stadiums
            </Link>
            <Link
              href="/competitions"
              className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 px-3 py-2 text-sm font-medium"
            >
              Competitions
            </Link>
            <Link
              href="/stats"
              className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 px-3 py-2 text-sm font-medium"
            >
              Statistics
            </Link>
            <Link
              href="/add-match"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Add Match
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-green-600 hover:bg-gray-100 dark:hover:bg-gray-800"
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
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 shadow-lg">
            <Link
              href="/matches"
              className="text-gray-600 dark:text-gray-300 hover:text-green-600 block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              My Matches
            </Link>
            <Link
              href="/stadiums"
              className="text-gray-600 dark:text-gray-300 hover:text-green-600 block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Stadiums
            </Link>
            <Link
              href="/competitions"
              className="text-gray-600 dark:text-gray-300 hover:text-green-600 block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Competitions
            </Link>
            <Link
              href="/stats"
              className="text-gray-600 dark:text-gray-300 hover:text-green-600 block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Statistics
            </Link>
            <Link
              href="/add-match"
              className="bg-green-600 hover:bg-green-700 text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Add Match
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}