import { useState } from 'react';
import { TeamWithCountry, VenueRow } from '@/types';

type TeamWithVenue = TeamWithCountry & {
  home_venue: VenueRow | null;
};

interface TeamHeaderProps {
  team: TeamWithVenue;
}

export default function TeamHeader({ team }: TeamHeaderProps) {
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
    <div className="text-center py-8">
      {/* Team Name */}
      <h1 className="text-5xl font-bold text-gray-900 mb-6">
        {team.name}
      </h1>
      
      {/* Team Logo */}
      <div className="flex justify-center mb-6">
        <div className="w-32 h-32 relative">
          {team.logo_url && !logoError ? (
            <img
              src={team.logo_url}
              alt={`${team.name} logo`}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                logoLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onError={handleLogoError}
              onLoad={handleLogoLoad}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {team.national ? '🌍' : '⚽'}
            </div>
          )}
          
          {logoLoading && team.logo_url && !logoError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-3 border-green-600"></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Country with Flag */}
      {team.country && (
        <div className="flex items-center justify-center space-x-3 mb-4">
          <span className="text-3xl">
            {team.country.flag ? (
              <img
                src={team.country.flag}
                alt={`${team.country.name} flag`}
                className="w-8 h-5 object-cover rounded-sm border border-gray-300"
              />
            ) : (
              '🏳️'
            )}
          </span>
          <span className="text-xl font-medium text-gray-700">
          </span>
          <span className="text-xl font-medium text-gray-700">
            {team.country.name}
          </span>
        </div>
      )}
      
      {/* Stadium */}
      {team.home_venue && (
        <div className="flex items-center justify-center space-x-3">
          <span className="text-2xl">🏟️</span>
          <span className="text-lg font-medium text-gray-700">
            {team.home_venue.name}
          </span>
        </div>
      )}
    </div>
  );
}