import Link from 'next/link';
import { useState } from 'react';
import { Venue } from '@prisma/client';
import { TeamWithCountry } from '@/lib/prisma';

// Icon components
const MapPinIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const UsersIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);

const HomeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

type VenueWithTeams = Venue & {
  teams: TeamWithCountry[];
};

interface VenueCardProps {
  venue: VenueWithTeams;
}

export default function VenueCard({ venue }: VenueCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <Link
      href={`/venues/${venue.id}`}
      className="group block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:shadow-blue-100/50 hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-2"
    >
      {/* Venue Image */}
      <div className="h-48 relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600">
        {venue.imageUrl && !imageError ? (
          <>
            <img
              src={venue.imageUrl}
              alt={venue.name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
          </>
        ) : (
          <>
            {/* Fallback gradient background */}
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-4xl mb-2">🏟️</div>
                <div className="text-sm font-medium opacity-90">Stadium</div>
              </div>
            </div>
          </>
        )}
        {/* Capacity Badge */}
        {venue.capacity && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
            <UsersIcon className="w-3 h-3 inline mr-1" />
            {venue.capacity.toLocaleString()}
          </div>
        )}
      </div>

      {/* Venue Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {venue.name}
          </h3>
          
          {/* Home Team */}
          {venue.teams.length > 0 && (
            <div className="flex items-center space-x-2 mb-3">
              <HomeIcon className="w-4 h-4 text-blue-500" />
              <span className="text-blue-600 font-medium text-sm">
                {venue.teams[0].name}
              </span>
              {venue.teams[0].country && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {venue.teams[0].country.name}
                </span>
              )}
            </div>
          )}
          
          {/* Address */}
          {venue.address && (
            <div className="flex items-start space-x-2">
              <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5" />
              <p className="text-gray-600 text-sm line-clamp-2 flex-1">
                {venue.address}
              </p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            {venue.surface && (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                {venue.surface}
              </span>
            )}
            {venue.teams.length > 1 && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                +{venue.teams.length - 1} teams
              </span>
            )}
          </div>
          <div className="text-blue-500 group-hover:text-blue-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}