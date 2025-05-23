'use client';
import { useEffect, useState } from 'react';
import VisitCard from './visitCard';
import { MatchVisitWithDetails } from '@/types/includeDB';
import FootballLoader from '@/components/Loader/FootballLoader';

export default function VisitsPage() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/user/visits')
      .then((res) => {
        if (res.status === 401) {
          alert('You are not logged in. Redirecting to login page.');
          window.location.href = '/login';
          return null;
        }
        
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res;
      })
      .then((res) => {
        if (res) {
          return res.json();
        }
        return [];
      })
      .then(setVisits)
      .then(() => setLoading(false))
      .catch((error) => {
        console.error('Error fetching visits:', error);
        setError(error);
        setLoading(false);
      });
  }, []);

  function sortByDate(a: MatchVisitWithDetails, b: MatchVisitWithDetails) {
    const dateA = new Date(a.match.date);
    const dateB = new Date(b.match.date);
    return dateB.getTime() - dateA.getTime();
  }
  
  if (loading) return (
    <FootballLoader />
  );
  if (error) return <p className="p-4 text-red-500">Error loading visits.</p>;
  if (visits.length === 0) return <p className="p-4 text-gray-500">No visits yet.</p>;

  return (
    <div className="p-4">
      <div className="relative w-full py-4 mb-2">
        <h1 className="text-3xl font-bold text-center flex-1 mb-2">Visits</h1>
        <button className="sm:absolute sm:right-4 sm:top-1/2 sm:-translate-y-1/2 cursor-pointer
        bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          <a href="/addVisit">
            Add Visit
          </a>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visits.sort(sortByDate).map((visit: MatchVisitWithDetails) => <VisitCard key={visit.id} visit={visit} /> )}
      </div>
    </div>
  );
}
