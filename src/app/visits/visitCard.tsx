import React from 'react';
import { MatchVisitWithDetails } from '@/types/includeDB';
import Image from 'next/image';

interface VisitCardProps {
  visit: MatchVisitWithDetails;
}

const VisitCard: React.FC<VisitCardProps> = ({ visit }) => {
  if (!visit.match) {
    return <div className="p-4 text-gray-500">No match data available.</div>;
  }
  if (!visit.match.homeTeam || !visit.match.awayTeam) {
    return <div className="p-4 text-gray-500">No team data available.</div>;
  }
  
  return (
    <a href={`/visits/${visit.id}`} className="w-full sm:w-[360px] bg-white shadow rounded-xl p-4 flex flex-col border border-gray-200">
      <div className="flex items-center flex flex-col mb-4">
        <span className="text-lg font-bold text-gray-800">
          {visit.match.competition?.name}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(visit.match.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
          })}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center w-[132px]">
          <Image
            src={visit.match.homeTeam.crest || ''}
            alt={`${visit.match.homeTeam.shortName} crest`}
            className="w-16 h-16 object-contain"
            width={128}
            height={128}
          />
          <span className="mt-2 text-sm font-medium text-gray-700">
            {visit.match.homeTeam.name}
          </span>
        </div>
        <div className="text-center w-[48px]">
          {visit.match.homeScore !== null && visit.match.awayScore !== null ? (
            <span className="text-lg font-bold text-gray-800">
              {visit.match.homeScore} - {visit.match.awayScore}
            </span>
          ) : (
            <span className="text-sm text-gray-500">Match not played</span>
          )}
        </div>
        <div className="flex flex-col items-center w-[132px]">
          <Image
            src={visit.match.awayTeam.crest || ''}
            alt={`${visit.match.awayTeam.shortName} crest`}
            className="w-16 h-16 object-contain"
            width={128}
            height={128}
          />
          <span className="mt-2 text-sm font-medium text-gray-700">
            {visit.match.awayTeam.name}
          </span>
        </div>
      </div>
      <div className='mt-4 flex flex-col items-center'>
        <span className="text-md text-gray-600">
          {visit.match.stadium?.name ?? visit.match.homeTeam.stadium?.name}
        </span>
      </div>
    </a>
  );
};

export default VisitCard;