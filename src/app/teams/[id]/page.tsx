'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { TeamWithCountry, VenueRow } from '@/types';

// Import section components
import TeamHeader from './sections/TeamHeader';
// import TeamStats from './sections/TeamStats';
// import TeamVenue from './sections/TeamVenue';
import TeamMatches from './sections/TeamMatches';

type TeamWithVenue = TeamWithCountry & {
  home_venue: VenueRow | null;
};

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.id as string;
  
  const [team, setTeam] = useState<TeamWithVenue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'matches' | 'stats' | 'venue'>('matches');

  useEffect(() => {
    const fetchTeam = async () => {
      if (!teamId) return;
      
      try {
        const response = await fetch(`/api/teams/${teamId}`);
        if (response.ok) {
          const data = await response.json();
          setTeam(data);
        } else {
          setError('Team not found');
        }
      } catch (error) {
        console.error('Error fetching team:', error);
        setError('Error loading team details');
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [teamId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-green-600"></div>
              <span className="text-gray-600 font-medium text-lg">Loading team details...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😞</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              {error || 'Team not found'}
            </h3>
            <p className="text-gray-500 mb-6">
              The team you're looking for doesn't exist or there was an error loading the details.
            </p>
            <a 
              href="/teams"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Back to Teams
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        
        {/* Team Header Section */}
        <TeamHeader team={team} />
        
        {/* Main Tab Navigation */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 max-w-md">
              <button
                onClick={() => setActiveTab('matches')}
                className={`flex-1 py-3 px-6 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'matches'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Team Matches
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex-1 py-3 px-6 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'stats'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Statistics
              </button>
              <button
                onClick={() => setActiveTab('venue')}
                className={`flex-1 py-3 px-6 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'venue'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Home Venue
              </button>
            </div>
          </div>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'matches' && <TeamMatches team={team} />}
        {activeTab === 'stats' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <p className="text-gray-500 text-center py-8">Team statistics coming soon...</p>
          </div>
        )}
        {activeTab === 'venue' && team.home_venue && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <p className="text-gray-500 text-center py-8">Venue details coming soon...</p>
          </div>
        )}
        
      </div>
    </div>
  );
}