'use client';
import React, { useEffect, useState } from 'react';
import FootballMap from './FootballMap';
import { MapStadium } from '@/types/map';
import FootballLoader from '@/components/Loader/FootballLoader';

const MapPage = () => {
  const [stadiums, setStadiums] = useState<MapStadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch('/api/user/stadiums')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error fetching stadiums: ${res.status}`);
        }
        return res;
      })
      .then((res) => res.json())
      .then((data) => {
          if (!Array.isArray(data)) {
            throw new Error('Invalid data format');
          }
          const uniqueStadiums = Array.from(new Set(data.map((stadium: MapStadium) => stadium.id)))
            .map((id) => data.find((stadium: MapStadium) => stadium.id === id))
            .filter((stadium: MapStadium | undefined) => stadium !== undefined) as MapStadium[];
          setStadiums(uniqueStadiums);
        }
      )
      .then(() => setLoading(false))
      .catch((error) => {
        console.error('Error fetching stadiums:', error);
        setError(error);
        setLoading(false);
      });
  }, []);

  if (loading) return <FootballLoader />;
  if (error) return <p>Error loading stadiums: {error.message}</p>;
  if (stadiums.length === 0) return <p>No stadiums found.</p>;

  return (
    <main>
      <h1 className='my-4 text-2xl text-bold'>Football Map</h1>
      <FootballMap stadiums={stadiums}  />
    </main>
  );
};

export default MapPage;