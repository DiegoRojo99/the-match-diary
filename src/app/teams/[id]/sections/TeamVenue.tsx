import { useState } from 'react';
import Link from 'next/link';
import { TeamWithCountry, VenueRow } from '@/types';

type TeamWithVenue = TeamWithCountry & {
  home_venue: VenueRow | null;
};

interface TeamVenueProps {
  team: TeamWithVenue;
  venue: VenueRow;
}

export default function TeamVenue({ team, venue }: TeamVenueProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const venueDetails = [
    {
      label: 'Capacity',
      value: venue.capacity ? venue.capacity.toLocaleString() : 'Unknown',
      icon: '👥',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      label: 'Surface',
      value: venue.surface || 'Unknown',
      icon: venue.surface === 'grass' ? '🌱' : '⚡',
      color: venue.surface === 'grass' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
    },
    {
      label: 'Address',
      value: venue.address || 'Not provided',
      icon: '🗺️',
      color: 'bg-gray-100 text-gray-800'
    }
  ];

  return (
    <div className="mb-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg">
              <span className="text-white text-xl">🏟️</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Home Stadium</h2>
              <p className="text-gray-600">Where {team.name} plays their home games</p>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-0">
          
          {/* Venue Image */}
          <div className="relative h-64 md:h-full">
            {venue.image_url && !imageError ? (
              <>
                <img
                  src={venue.image_url}
                  alt={venue.name}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                {/* Stadium name overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                    {venue.name}
                  </h3>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🏟️</div>
                  <h3 className="text-2xl font-bold mb-2">{venue.name}</h3>
                  <p className="text-blue-100 text-sm">Stadium Image</p>
                </div>
              </div>
            )}
            
            {imageLoading && venue.image_url && !imageError && (
              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
          
          {/* Venue Details */}
          <div className="p-6">
            
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{venue.name}</h3>
              <p className="text-gray-600">Home stadium of {team.name}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {venueDetails.map((detail, index) => (
                <div key={index} className="group">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${detail.color}`}>
                      <span className="text-sm">{detail.icon}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600">
                        {detail.label}
                      </p>
                      <p className="text-base font-semibold text-gray-900 truncate" title={detail.value}>
                        {detail.value}
                      </p>
                    </div>
                    
                  </div>
                </div>
              ))}
            </div>
            
            {/* View Stadium Button */}
            <div className="mt-6">
              <Link
                href={`/venues/${venue.id}`}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold text-center block hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02]"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>View Stadium Details</span>
                  <span>→</span>
                </span>
              </Link>
            </div>
            
          </div>
          
        </div>
        
      </div>
    </div>
  );
}