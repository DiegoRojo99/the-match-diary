import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PrismaClient } from '@prisma/generated/client';
import { MatchVisitWithDetails } from '@/types/includeDB';

const prisma = new PrismaClient();

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const visits: MatchVisitWithDetails[] = await prisma.matchVisit.findMany({
    where: { userId: user.id },
    include: {
      match: {
        include: {
          homeTeam: {
            include: {
              stadium: true,
            },
          },
          awayTeam: true,
          competition: true,
          stadium: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const stadiums = visits.map((visit) => {
    const stadium = visit.match.stadium || visit.match.homeTeam.stadium;
    if (!stadium) return null;

    const coordinates = {
      latitude: visit.match.homeTeam.latitude,
      longitude: visit.match.homeTeam.longitude,
    };
    if (!coordinates.latitude || !coordinates.longitude) {
      return null;
    }
    
    return {
      id: stadium.id,
      name: stadium.name,
      crestUrl: visit.match.homeTeam.crest,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude
    }
  }).filter(stadium => stadium !== null);

  if (stadiums.length === 0) {
    return NextResponse.json({ message: 'No stadiums found' }, { status: 404 });
  }

  const uniqueStadiums = Array.from(new Set(stadiums.map(stadium => stadium.id)))
    .map(id => stadiums.find(stadium => stadium.id === id))
  return NextResponse.json(uniqueStadiums);
}