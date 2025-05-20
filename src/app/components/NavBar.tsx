'use client';

import React from 'react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="w-full bg-(--color-mountain-meadow-300) shadow-md py-4 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-xl font-semibold text-gray-800 hover:text-blue-600">
          The Match Diary
        </Link>
      </div>

      <ul className="flex items-center space-x-6">
        <li>
          <Link href="/addVisit" className="text-gray-700 hover:text-blue-600 transition-colors">
            Add Visit
          </Link>
        </li>
        <li>
          <Link href="/visits" className="text-gray-700 hover:text-blue-600 transition-colors">
            Visits
          </Link>
        </li>
        <li>
          <Link href="/map" className="text-gray-700 hover:text-blue-600 transition-colors">
            Map
          </Link>
        </li>
      </ul>
    </nav>
  );
}