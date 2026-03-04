'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TeamWithCountry, VenueRow } from '@/types';

// Icon components
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

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamWithVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'national' | 'club'>('all');
  const [selectedCountry, setSelectedCountry] = useState('');

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/teams');
        if (response.ok) {
          const data = await response.json();
          setTeams(data);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  // Get unique countries for the filter
  const countries = teams
    .filter(team => team.country)
    .map(team => team.country!)
    .filter((country, index, self) => 
      index === self.findIndex(c => c.id === country.id)
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  // Filter teams based on search term and filters
  const filteredTeams = teams.filter((team: TeamWithVenue) => {
    const matchesSearch = 
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.team_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.country?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.home_venue?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      filterType === 'all' || 
      (filterType === 'national' && team.national) ||
      (filterType === 'club' && !team.national);
    
    const matchesCountry = 
      !selectedCountry || 
      (team.country?.id.toString() === selectedCountry);

    return matchesSearch && matchesType && matchesCountry;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Football Teams
            </h1>
            <p className="text-lg text-gray-600">Explore teams from around the world</p>
          </div>
          <div className="flex justify-center items-center py-20">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-green-600"></div>
              <span className="text-gray-600 font-medium text-lg">Loading teams...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Football Teams
          </h1>
          <p className="text-lg text-gray-600 mb-6">Explore teams from around the world</p>
          
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative max-w-md mx-auto lg:mx-0">
                <input
                  type="text"
                  placeholder="Search teams, countries, or venues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 text-gray-700 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Team Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Team Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">All Teams</option>
                  <option value="national">National Teams</option>
                  <option value="club">Club Teams</option>
                </select>
              </div>

              {/* Country Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All Countries</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id.toString()}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Total Teams</h3>
                <p className="text-3xl font-bold text-green-600">{filteredTeams.length}</p>
              </div>
              <div className="text-4xl">⚽</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Club Teams</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {filteredTeams.filter(team => !team.national).length}
                </p>
              </div>
              <div className="text-4xl">🏟️</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">National Teams</h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {filteredTeams.filter(team => team.national).length}
                </p>
              </div>
              <div className="text-4xl">🌍</div>
            </div>
          </div>
        </div>
        
        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTeams.map((team) => (
            <Link
              key={team.id}
              href={`/teams/${team.id}`}
              className="group block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:shadow-green-100/50 hover:border-green-300 transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Team Header */}
              <div className={`h-32 ${team.national ? 'bg-gradient-to-br from-yellow-500 to-amber-600' : 'bg-gradient-to-br from-green-500 to-emerald-600'} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-3xl mb-2">{team.national ? '🌍' : '⚽'}</div>
                    <div className="text-sm font-medium opacity-90">
                      {team.national ? 'National Team' : 'Club Team'}
                    </div>
                  </div>
                </div>
                {/* Team Code Badge */}
                {team.team_code && (
                  <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs font-bold">
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
          ))}
        </div>
        
        {/* Empty State */}
        {filteredTeams.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterType !== 'all' || selectedCountry ? 'No teams found' : 'No teams available'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterType !== 'all' || selectedCountry 
                ? 'Try adjusting your search terms or filters.' 
                : 'Check back later for new teams.'}
            </p>
            {(searchTerm || filterType !== 'all' || selectedCountry) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setSelectedCountry('');
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}