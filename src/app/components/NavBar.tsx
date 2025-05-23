'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaBars, FaTimes } from 'react-icons/fa'; // Import icons from react-icons

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-green-300 shadow-md py-4 px-6 flex items-center justify-between relative">
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-xl font-semibold text-gray-800 hover:text-blue-600">
          The Match Diary
        </Link>
      </div>

      {/* Mobile menu toggle button */}
      <button
        className="md:hidden text-gray-700"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Navigation links */}
      <ul
        className={`${
          menuOpen ? 'flex' : 'hidden'
        } 
        md:flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 
        absolute md:static bg-green-200 md:bg-transparent left-0 w-full md:w-auto 
        top-14 md:top-auto p-4 md:p-0 z-10 border-y md:border-none transition-all duration-300 ease-in-out`
      }
      >
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