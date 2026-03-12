import Image from 'next/image';
import { CompetitionWithCountry } from '@/lib/prisma';

interface CompetitionHeaderProps {
  competition: CompetitionWithCountry;
}

export default function CompetitionHeader({ competition }: CompetitionHeaderProps) {
  const isLeague = competition.type === 'League';

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
      {/* Banner */}
      <div
        className={`h-40 ${
          isLeague
            ? 'bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700'
            : 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-600'
        } relative`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {competition.logoUrl ? (
            <Image
              src={competition.logoUrl}
              alt={competition.name}
              width={80}
              height={80}
              className="object-contain filter drop-shadow-2xl"
            />
          ) : (
            <span className="text-7xl">{isLeague ? '🏆' : '🥇'}</span>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
      </div>

      {/* Info */}
      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{competition.name}</h1>
            {competition.country && (
              <div className="flex items-center space-x-2 text-gray-600">
                {competition.country.flag && (
                  <img
                    src={competition.country.flag}
                    alt={competition.country.name}
                    className="w-6 h-4 object-cover rounded-sm"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <span>{competition.country.name}</span>
                {competition.country.code && (
                  <span className="text-gray-400 text-sm">({competition.country.code})</span>
                )}
              </div>
            )}
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              isLeague
                ? 'bg-purple-100 text-purple-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {competition.type}
          </span>
        </div>
      </div>
    </div>
  );
}
