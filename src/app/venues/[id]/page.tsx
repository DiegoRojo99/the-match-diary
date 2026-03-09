'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { VenueWithDetails } from '@/types/db/venues';
import FootballLoader from '@/components/FootballLoader';

// Icon components
const ArrowLeftIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const MapPinIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const UsersIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);

export default function VenuePage() {
  const params = useParams();
  const router = useRouter();
  const [venue, setVenue] = useState<VenueWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchVenue = async () => {
      if (!params.id) return;

      try {
        const response = await fetch(`/api/venues/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch venue');
        
        const data = await response.json();
        setVenue(data);
      } 
      catch (error) {
        console.error('Error fetching venue:', error);
      } 
      finally {
        setLoading(false);
      }
    };

    fetchVenue();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FootballLoader size="xl" text="Loading venue details..." />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">🏟️</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Venue not found</h3>
          <p className="text-gray-600 mb-6">The venue you're looking for doesn't exist or has been removed.</p>
          <Link 
            href="/venues" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Venues
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Full-Width Image */}
      <div className="relative w-full h-[60vh] min-h-[400px] overflow-hidden">
        {venue.image_url && !imageError ? (
          <Image
            src={venue.image_url}
            alt={venue.name}
            fill
            className="object-cover"
            priority
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-8xl mb-4">🏟️</div>
                <h2 className="text-2xl font-semibold opacity-90">Stadium</h2>
              </div>
            </div>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
        
        {/* Back Button Overlay */}
        <div className="absolute top-6 left-6 z-10">
          <Link
            href="/venues"
            className="inline-flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-900 rounded-lg hover:bg-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Venues
          </Link>
        </div>

        {/* Venue Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <div className="max-w-4xl">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                {venue.name}
              </h1>
              {venue.address && (
                <div className="flex items-center text-white/90 text-lg">
                  <MapPinIcon className="w-5 h-5 mr-2" />
                  <span className="drop-shadow">{venue.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Stats */}
          <div className="lg:col-span-2 space-y-8">
            {/* Key Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Capacity */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Capacity</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {venue.capacity?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <UsersIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Surface */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Surface</p>
                    <p className="text-xl font-bold text-gray-900 capitalize">
                      {venue.surface || 'Unknown'}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <div className="w-6 h-6 text-2xl">🌿</div>
                  </div>
                </div>
              </div>

              {/* Teams Count */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Home Teams</p>
                    <p className="text-3xl font-bold text-gray-900">{venue.teams.length}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <div className="w-6 h-6 text-2xl">⚽</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Teams Section */}
            {venue.teams.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="mr-3 text-3xl">🏠</span>
                  Home Teams
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {venue.teams.map((team) => (
                    <div key={team.id} className="group p-5 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {team.logo_url ? (
                            <Image
                              src={team.logo_url}
                              alt={team.name}
                              width={56}
                              height={56}
                              className="rounded-xl"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl flex items-center justify-center">
                              <span className="text-xl font-bold text-blue-800">
                                {team.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                            {team.name}
                          </h3>
                          {team.country && (
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {team.country.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Quick Info */}
            {venue.country && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Location</h3>
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">
                    {venue.country.code === 'GB' ? '🇬🇧' : 
                     venue.country.code === 'ES' ? '🇪🇸' : 
                     venue.country.code === 'FR' ? '🇫🇷' : 
                     venue.country.code === 'DE' ? '🇩🇪' : 
                     venue.country.code === 'IT' ? '🇮🇹' : '🏳️'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{venue.country.name}</p>
                    <p className="text-sm text-gray-500">{venue.country.code}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200/50">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Stadium Features</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">🏟️</div>
                  <span className="text-sm">Professional Stadium</span>
                </div>
                {venue.surface && (
                  <div className="flex items-center text-gray-700">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">🌿</div>
                    <span className="text-sm capitalize">{venue.surface} Surface</span>
                  </div>
                )}
                {venue.capacity && (
                  <div className="flex items-center text-gray-700">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">👥</div>
                    <span className="text-sm">{venue.capacity.toLocaleString()} Capacity</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}