'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import AddPhotoForm from './AddPhotoForm';
import FootballLoader from '@/components/Loader/FootballLoader';
import { MatchVisitWithDetails } from '@/types/includeDB';
import { Photo } from '@prisma/generated/client';
import { format } from 'date-fns';

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
  console.log('MatchVisit Photos:', photos);
  const { homeTeam, awayTeam, competition, homeScore, awayScore } = match;

  return (
    <div className="py-8 px-4 space-y-6">
      <div className='pb-8'>          
        {/* Header */}
        <div className="flex flex-col items-center justify-center pb-4">
            <Image
              src={competition.logoUrl ?? ''}
              alt={competition.name}
              width={64}
              height={64}
              className="w-16 h-16 sm:w-24 sm:h-24"
            />
            <h3 className="text-xl font-bold text-gray-400 mt-4">
              {format(new Date(match.date), 'EEE, dd MMMM yyyy')}
            </h3>
        </div>

        {/* Score */}
        <div className="flex justify-around items-center gap-4 text-3xl font-semibold">
          {/* Home Team */}
          <div>
            <Image 
              src={homeTeam.crest ?? ''} 
              alt={homeTeam.name}
              width={64} 
              height={64} 
              className='w-16 h-16 sm:w-32 sm:h-32 mx-auto' 
            />
            <span className="text-center text-sm text-gray-600">{homeTeam.name}</span>
          </div>
          <span>{homeScore}</span>

          <span>-</span>

          {/* Away Team */}
          <span>{awayScore}</span>
          <div>
            <Image 
              src={awayTeam.crest ?? ''} 
              alt={awayTeam.name}
              width={64} 
              height={64} 
              className='w-16 h-16 sm:w-32 sm:h-32 mx-auto' 
            />
            <span className="text-center text-sm text-gray-600">{awayTeam.name}</span>
          </div>
        </div>
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
          
          {/* Upload */}
          <div className="mt-4 flex flex-col items-center w-[320px] mx-auto">
          <AddPhotoForm visitId={visit.id} />
          </div>
        </div>
      )}
      {photos.length > 0 && (
        <div>
          <div className="flex flex-wrap gap-2 justify-center">
            {photos.map(photo => (
              <Image
                key={photo.id}
                src={photo.url}
                alt="Visit photo"
                width={640}
                height={0}
                className="w-full h-auto sm:w-80 sm:h-80 rounded-lg shadow-md object-cover"
              />
            ))}
            
            {/* Upload */}
            <div className="w-96 h-auto sm:w-80 sm:h-80 rounded-lg shadow-md justify-center items-center flex flex-col bg-gray-100">
              <AddPhotoForm visitId={visit.id} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
