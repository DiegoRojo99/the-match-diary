'use client';
import { useEffect, useState } from 'react';
import VisitCard from './visitCard';

export default function VisitsPage() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/visits')
      .then((res) => res.json())
      .then(setVisits)
      .then(() => setLoading(false))
      .catch((error) => {
        console.error('Error fetching visits:', error);
        setError(error);
        setLoading(false);
      });
  }, []);

  
  if (loading) return <p className="p-4 text-gray-500">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">Error loading visits.</p>;
  if (visits.length === 0) return <p className="p-4 text-gray-500">No visits yet.</p>;

  return (
    <div className="p-4 mt-4">
      <h1 className="text-2xl font-bold my-4">My Match Visits</h1>
      <div className="flex flex-wrap gap-4">
        {visits.map((visit: any) => <VisitCard key={visit.id} visit={visit} /> )}
      </div>
    </div>
  );
}
