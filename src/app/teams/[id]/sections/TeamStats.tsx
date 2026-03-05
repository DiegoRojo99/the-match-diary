import { TeamWithCountry, VenueRow } from '@/types';

type TeamWithVenue = TeamWithCountry & {
  home_venue: VenueRow | null;
};

interface TeamStatsProps {
  team: TeamWithVenue;
}

export default function TeamStats({ team }: TeamStatsProps) {
  const stats = [
    {
      label: 'Team Type',
      value: team.national ? 'National Team' : 'Club Team',
      icon: team.national ? '🌍' : '🏟️',
      color: team.national ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-green-100 text-green-800 border-green-200'
    },
    {
      label: 'Country',
      value: team.country?.name || 'Unknown',
      icon: '🌍',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      extra: team.country?.code
    },
    {
      label: 'Founded Year',
      value: team.founded_year ? team.founded_year.toString() : 'Unknown',
      icon: '📅',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      extra: team.founded_year ? `${new Date().getFullYear() - team.founded_year} years ago` : null
    },
    {
      label: 'Team Code',
      value: team.team_code || 'N/A',
      icon: '🏷️',
      color: 'bg-gray-100 text-gray-800 border-gray-200'
    },
    {
      label: 'Home Venue',
      value: team.home_venue?.name || 'No Stadium',
      icon: '🏟️',
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      extra: team.home_venue?.capacity ? `${team.home_venue.capacity.toLocaleString()} capacity` : null
    },
    {
      label: 'Database ID',
      value: team.id.toString(),
      icon: '🆔',
      color: 'bg-slate-100 text-slate-800 border-slate-200'
    }
  ];

  return (
    <div className="mb-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
            <span className="text-white text-xl">📊</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Team Information</h2>
            <p className="text-gray-600">Detailed information about {team.name}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="group">
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-transparent hover:border-gray-200 transition-all duration-200 hover:shadow-md">
                
                <div className="flex items-start space-x-3">
                  <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border ${stat.color}`}>
                    <span className="text-lg">{stat.icon}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-lg font-bold text-gray-900 mb-1 truncate" title={stat.value}>
                      {stat.value}
                    </p>
                    {stat.extra && (
                      <p className="text-xs text-gray-500">
                        {stat.extra}
                      </p>
                    )}
                  </div>
                </div>
                
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}