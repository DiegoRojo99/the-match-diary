import Link from 'next/link';
import { useState } from 'react';
import { TeamWithCountry, VenueRow } from '@/types';
import FootballLoader from '@/components/FootballLoader';

// Icon components
const HomeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const CalendarIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const GlobeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

type TeamWithVenue = TeamWithCountry & {
  home_venue: VenueRow | null;
};

interface TeamCardProps {
  team: TeamWithVenue;
}

export default function TeamCard({ team }: TeamCardProps) {
  const [logoError, setLogoError] = useState(false);
  const [logoLoading, setLogoLoading] = useState(true);

  const handleLogoError = () => {
    setLogoError(true);
    setLogoLoading(false);
  };

  const handleLogoLoad = () => {
    setLogoLoading(false);
  };

  return (
    <Link
      href={`/teams/${team.id}`}
      className="group block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:shadow-green-100/50 hover:border-green-300 transition-all duration-300 transform hover:-translate-y-2"
    >
      {/* Team Header */}
      <div className={`h-32 ${team.national ? 'bg-gradient-to-br from-yellow-500 to-amber-600' : 'bg-gradient-to-br from-green-500 to-emerald-600'} relative overflow-hidden`}>
        {/* Logo or fallback */}
        <div className="absolute inset-0 flex items-center justify-center">
          {team.logo_url && !logoError ? (
            <div className="relative">
              <img
                src={team.logo_url}
                alt={`${team.name} logo`}
                className={`w-16 h-16 object-contain filter drop-shadow-lg transition-opacity duration-300 ${
                  logoLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onError={handleLogoError}
                onLoad={handleLogoLoad}
              />
              {/* Loading state overlay */}
              {logoLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <FootballLoader size="sm" text="" className="text-white" />
                </div>
              )}
            </div>
          ) : (
            <div className="text-white text-center">
              <div className="text-3xl mb-2">{team.national ? '🌍' : '⚽'}</div>
              <div className="text-sm font-medium opacity-90">
                {team.national ? 'National Team' : 'Club Team'}
              </div>
            </div>
          )}
        </div>
        
        {/* Gradient overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10"></div>
        
        {/* Team Code Badge */}
        {team.team_code && (
          <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
            {team.team_code}
          </div>
        )}
      </div>

      {/* Team Content */}
      <div className="p-5">
        <div className="mb-4">
          <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-green-600 transition-colors">
            {team.name}
          </h3>
          
          {/* Country */}
          {team.country && (
            <div className="flex items-center space-x-2 mb-2">
              <GlobeIcon className="w-4 h-4 text-green-500" />
              <span className="text-green-600 font-medium text-sm">
                {team.country.name}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {team.country.code}
              </span>
            </div>
          )}
          
          {/* Home Venue */}
          {team.home_venue && (
            <div className="flex items-center space-x-2 mb-2">
              <HomeIcon className="w-4 h-4 text-blue-500" />
              <span className="text-blue-600 text-sm">
                {team.home_venue.name}
              </span>
            </div>
          )}
          
          {/* Founded Year */}
          {team.founded_year && (
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 text-sm">
                Founded {team.founded_year}
              </span>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <span className={`${team.national ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'} px-2 py-1 rounded-full text-xs font-medium`}>
              {team.national ? 'National' : 'Club'}
            </span>
          </div>
          <div className="text-green-500 group-hover:text-green-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}