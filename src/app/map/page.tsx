'use client';
import React, { useEffect, useState } from 'react';
import FootballMap from './FootballMap';
import { MapStadium } from '@/types/map';
import FootballLoader from '@/components/Loader/FootballLoader';
import { Team } from '@prisma/generated/client';
import { MatchVisitWithDetails } from '@/types/includeDB';
import Image from 'next/image';

type TeamWithNumberVisits = {
  team: Team;
  numberOfVisits: number;
};

const MapPage = () => {
  const [stadiums, setStadiums] = useState<MapStadium[]>([]);
  const [uniqueStadiums, setUniqueStadiums] = useState<MapStadium[]>([]);
  const [visits, setVisits] = useState<MatchVisitWithDetails[]>([]);
  const [teams, setTeams] = useState<TeamWithNumberVisits[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStadiums = fetch('/api/user/stadiums')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error fetching stadiums: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format');
        }
        const uniqueStadiums = Array.from(new Set(data.map((stadium: MapStadium) => stadium.id)))
          .map((id) => data.find((stadium: MapStadium) => stadium.id === id))
          .filter((stadium: MapStadium | undefined) => stadium !== undefined) as MapStadium[];
        setUniqueStadiums(uniqueStadiums);
        setStadiums(data);
      });

    const fetchVisits = fetch('/api/user/visits')
      .then((res) => {
        if (res.status === 401) {
          alert('You are not logged in. Redirecting to login page.');
          window.location.href = '/login';
          return null;
        }
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        if (!data || !Array.isArray(data)) throw new Error('Invalid visits data format');
        setVisits(data);

        const teamsWithVisitCount = data.reduce((acc: Record<string, TeamWithNumberVisits>, visit: MatchVisitWithDetails) => {
          // Home Team
          const homeTeamName = visit.match.homeTeam.name;
          if (!acc[homeTeamName]) {
            acc[homeTeamName] = { team: visit.match.homeTeam, numberOfVisits: 0 };
          }
          acc[homeTeamName].numberOfVisits += 1;

          // Away Team
          const awayTeamName = visit.match.awayTeam.name;
          if (!acc[awayTeamName]) {
            acc[awayTeamName] = { team: visit.match.awayTeam, numberOfVisits: 0 };
          }
          acc[awayTeamName].numberOfVisits += 1;

          return acc;
        }, {});
        setTeams(Object.values(teamsWithVisitCount));
      });

    Promise.all([fetchStadiums, fetchVisits])
      .catch((error) => {
        console.error('Error fetching data:', error);
        setError(error);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <FootballLoader />;
  if (error) return <p>Error loading stadiums: {error.message}</p>;
  if (!stadiums.length || !visits.length) return <p>No visits found.</p>;

  return (
    <main className='flex flex-col'>
      <h1 className='p-6 text-3xl text-start font-bold'>Football Map</h1>
      <div className='w-full flex sm:flex-row sm:justify-between sm:w-[97vw] sm:mx-auto h-[80vh] pt-2'>
        {/* MAP */}
        <FootballMap stadiums={uniqueStadiums}  />
        {/* VISIT STATS */}
        <div className='p-4 bg-white shadow-md rounded-lg ml-4 w-[320px] text-start border border-gray-300'>
          <h2 className='text-[36px] font-semibold'>{visits.length}</h2>
          <p className='text-gray-600 mb-4'>Total Visits</p>

          <p className='text-gray-600'>Most seen teams:</p>
          <ul className='list-disc pb-2'>
            {teams.sort((a, b) => b.numberOfVisits - a.numberOfVisits).slice(0, 5).map((teamWithNumber) => (
              <li key={teamWithNumber.team.id} className='text-gray-800 list-none my-2'>
                <Image
                  src={teamWithNumber.team.crest ?? ''}
                  alt={teamWithNumber.team.name}
                  width={96}
                  height={96}
                  className='inline-block mr-2 w-8 h-auto'
                />
                {teamWithNumber.team.name} ({teamWithNumber.numberOfVisits})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
};

export default MapPage;