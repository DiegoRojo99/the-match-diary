import Link from 'next/link';
import { useState } from 'react';
import FootballLoader from '@/components/FootballLoader';
import { CompetitionWithCountry } from '@/lib/prisma';

interface CompetitionCardProps {
  competition: CompetitionWithCountry;
}

export default function CompetitionCard({ competition }: CompetitionCardProps) {
  const [logoError, setLogoError] = useState(false);
  const [logoLoading, setLogoLoading] = useState(true);

  const isLeague = competition.type === 'League';

  return (
    <Link
      href={`/competitions/${competition.id}`}
      className="group block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:shadow-purple-100/50 hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-2"
    >
      {/* Competition Header */}
      <div
        className={`h-32 ${
          isLeague
            ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
            : 'bg-gradient-to-br from-amber-500 to-orange-600'
        } relative overflow-hidden`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {competition.logoUrl && !logoError ? (
            <div className="relative">
              <img
                src={competition.logoUrl}
                alt={`${competition.name} logo`}
                className={`w-16 h-16 object-contain filter drop-shadow-lg transition-opacity duration-300 ${
                  logoLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onError={() => { setLogoError(true); setLogoLoading(false); }}
                onLoad={() => setLogoLoading(false)}
              />
              {logoLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <FootballLoader size="sm" text="" className="text-white" />
                </div>
              )}
            </div>
          ) : (
            <div className="text-white text-center">
              <div className="text-3xl mb-2">{isLeague ? '🏆' : '🥇'}</div>
              <div className="text-sm font-medium opacity-90">{isLeague ? 'League' : 'Cup'}</div>
            </div>
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

        {/* Type badge */}
        <div
          className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${
            isLeague
              ? 'bg-purple-700/80 text-white'
              : 'bg-amber-700/80 text-white'
          }`}
        >
          {competition.type}
        </div>
      </div>

      {/* Competition Content */}
      <div className="p-5">
        <div className="mb-4">
          <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {competition.name}
          </h3>

          {competition.country && (
            <div className="flex items-center space-x-2">
              {competition.country.flag ? (
                <img
                  src={competition.country.flag}
                  alt={competition.country.name}
                  className="w-5 h-4 object-cover rounded-sm"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <span className="text-sm">🌍</span>
              )}
              <span className="text-gray-600 text-sm">{competition.country.name}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isLeague ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {competition.type}
          </span>
          <div className="text-purple-500 group-hover:text-purple-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
