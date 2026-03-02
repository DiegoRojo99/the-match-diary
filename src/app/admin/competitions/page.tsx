'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

interface Competition {
  id: number;
  api_id: number;
  name: string;
  type: string;
  visible: boolean;
}

interface CountryGroup {
  countryName: string;
  country: {
    name: string;
    code: string | null;
  };
  competitions: Competition[];
}

export default function AdminCompetitions() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [competitions, setCompetitions] = useState<CountryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set(['World'])); // World expanded by default
  const [updating, setUpdating] = useState<Set<number>>(new Set());

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Fetch competitions data
  useEffect(() => {
    if (!user) return;
    
    fetchCompetitions();
  }, [user]);

  const fetchCompetitions = async () => {
    try {
      const response = await fetch('/api/admin/competitions');
      if (!response.ok) throw new Error('Failed to fetch competitions');
      
      const data = await response.json();
      setCompetitions(data);
    } catch (error) {
      console.error('Error fetching competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCompetitionVisibility = async (competitionId: number, currentVisible: boolean) => {
    setUpdating(prev => new Set(prev).add(competitionId));
    
    try {
      const response = await fetch('/api/admin/competitions/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          competitionId,
          visible: !currentVisible
        })
      });

      if (!response.ok) throw new Error('Failed to update competition');

      // Update local state
      setCompetitions(prevCompetitions => 
        prevCompetitions.map(countryGroup => ({
          ...countryGroup,
          competitions: countryGroup.competitions.map(comp =>
            comp.id === competitionId ? { ...comp, visible: !currentVisible } : comp
          )
        }))
      );
      
    } catch (error) {
      console.error('Error updating competition:', error);
      alert('Failed to update competition visibility');
    } finally {
      setUpdating(prev => {
        const newSet = new Set(prev);
        newSet.delete(competitionId);
        return newSet;
      });
    }
  };

  const toggleCountryExpansion = (countryName: string) => {
    setExpandedCountries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(countryName)) {
        newSet.delete(countryName);
      } else {
        newSet.add(countryName);
      }
      return newSet;
    });
  };

  const filteredCompetitions = competitions
    .map(countryGroup => ({
      ...countryGroup,
      competitions: countryGroup.competitions.filter(comp =>
        comp.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(countryGroup => countryGroup.competitions.length > 0);

  // Calculate statistics
  const totalCompetitions = competitions.reduce((sum, group) => sum + group.competitions.length, 0);
  const visibleCompetitions = competitions.reduce((sum, group) => 
    sum + group.competitions.filter(comp => comp.visible).length, 0
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading competitions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Competition Management</h1>
                <p className="mt-2 text-gray-600">Manage visibility of competitions in your match diary</p>
              </div>
              <button 
                onClick={() => router.push('/')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-500">Total Competitions</p>
                <p className="text-2xl font-semibold text-gray-900">{totalCompetitions}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">🏆</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-500">Visible Competitions</p>
                <p className="text-2xl font-semibold text-green-600">{visibleCompetitions}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">👁️</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-500">Hidden Competitions</p>
                <p className="text-2xl font-semibold text-gray-600">{totalCompetitions - visibleCompetitions}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 text-xl">🚫</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search competitions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Competitions by Country */}
        <div className="space-y-6">
          {filteredCompetitions.map((countryGroup) => {
            const isExpanded = expandedCountries.has(countryGroup.countryName);
            const visibleCount = countryGroup.competitions.filter(comp => comp.visible).length;
            
            return (
              <div key={countryGroup.countryName} className="bg-white rounded-lg shadow overflow-hidden">
                <button
                  onClick={() => toggleCountryExpansion(countryGroup.countryName)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {countryGroup.countryName === 'World' ? '🌍' : '🏴'}
                    </span>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {countryGroup.countryName}
                        {countryGroup.country.code && ` (${countryGroup.country.code})`}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {visibleCount}/{countryGroup.competitions.length} visible
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {countryGroup.competitions.length} competitions
                    </span>
                    <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="border-t border-gray-200">
                    <div className="px-6 py-4 space-y-4">
                      {countryGroup.competitions.map((competition) => (
                        <div key={competition.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                competition.type === 'League' 
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {competition.type}
                              </span>
                              <h4 className="font-medium text-gray-900">{competition.name}</h4>
                              <span className="text-sm text-gray-500">ID: {competition.api_id}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <span className={`text-sm font-medium ${
                              competition.visible ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {competition.visible ? 'Visible' : 'Hidden'}
                            </span>
                            
                            <button
                              onClick={() => toggleCompetitionVisibility(competition.id, competition.visible)}
                              disabled={updating.has(competition.id)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                competition.visible ? 'bg-blue-600' : 'bg-gray-200'
                              } ${updating.has(competition.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  competition.visible ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredCompetitions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No competitions found</h3>
            <p className="text-gray-500">Try adjusting your search term</p>
          </div>
        )}
      </div>
    </div>
  );
}