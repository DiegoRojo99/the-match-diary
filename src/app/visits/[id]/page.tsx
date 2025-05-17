'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import AddPhotoForm from './AddPhotoForm';
import FootballLoader from '@/components/Loader/FootballLoader';
import { MatchVisitWithDetails } from '@/types/includeDB';
import { Photo } from '@prisma/generated/client';

type MatchVisitWithDetailsAndPhotos = MatchVisitWithDetails & {
  photos: Photo[];
};

export default function MatchVisitDetailsPage() {
  const [visit, setVisit] = useState<MatchVisitWithDetailsAndPhotos | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const visitId = params.id as string;

  useEffect(() => {
    if (!visitId) return;

    async function fetchVisit() {
      try {
        const res = await fetch(`/api/matchVisit/${visitId}`);
        const data = await res.json();
        setVisit(data);
      } 
      catch (err) {
        console.error(err);
        setLoading(false);
      } 
      finally {
        setLoading(false);
      }
    }

    fetchVisit();
  }, [visitId]);

  if (loading) return <FootballLoader />;
  if (!visit) return <div className="text-center py-10">Visit not found</div>;

  const { match, photos } = visit;
  const { homeTeam, awayTeam, competition, stadium, homeScore, awayScore } = match;

  return (
    <div className="py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-center pb-2">
          <Image
            src={competition.logoUrl ?? ''}
            alt={competition.name}
            width={64}
            height={64}
          />
      </div>

      {/* Score */}
      <div className="flex justify-around items-center gap-4 text-3xl font-semibold">
        {/* Home Team */}
        <Image src={homeTeam.crest ?? ''} alt={homeTeam.name} width={64} height={64} className='w-32 h-32' />
        <span>{homeScore}</span>

        <span>-</span>

        {/* Away Team */}
        <span>{awayScore}</span>
        <Image src={awayTeam.crest ?? ''} alt={awayTeam.name} width={64} height={64} className='w-32 h-32' />
      </div>

      {/* Review */}
      {/* <div>
        <h2 className="font-bold text-lg mb-1">Your Review</h2>
        <p className="bg-gray-100 p-3 rounded text-sm">{review || 'No review added yet.'}</p>
      </div> */}

      {/* Photos */}
      {photos.length === 0 && (
        <div className="text-center py-10">
          <h2 className="text-lg font-semibold text-gray-600">No photos added yet</h2>
        </div>
      )}
      {photos.length > 0 && (
        <div>
          <h2 className="font-bold text-lg mb-2">Photos</h2>
          <div className="flex flex-wrap gap-2">
            {photos.map(photo => (
              <Image
                key={photo.id}
                src={photo.url}
                alt="Visit photo"
                width={128}
                height={128}
                className="rounded object-cover"
              />
            ))}
          </div>
        </div>
      )}

      {/* Upload */}
      <AddPhotoForm visitId={visit.id} />
    </div>
  );
}
