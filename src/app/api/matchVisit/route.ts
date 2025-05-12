import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/generated/client';
import { createClient } from '@/lib/supabase/server';
import { addDays, subDays } from 'date-fns';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error) {
      console.error('[POST_MATCH_VISIT] Error fetching user:', error);
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = user.id;
    const body = await req.json();
    const {
      selectedCompetition,
      matchDate,
      homeTeamId,
      awayTeamId,
      homeScore = 0,
      awayScore = 0,
      review,
    } = body;

    if (!selectedCompetition || !matchDate || !homeTeamId || !awayTeamId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const matchDateObj = new Date(matchDate);

    const season = await prisma.season.findFirst({
      where: {
        competitionId: selectedCompetition,
        startDate: { lte: matchDateObj },
        endDate: { gte: matchDateObj },
      },
    });

    const homeTeamData = await prisma.team.findUnique({
      where: { id: homeTeamId },
    });

    const stadiumId = homeTeamData?.stadiumId ?? null;

    const dateRangeStart = subDays(matchDateObj, 7);
    const dateRangeEnd = addDays(matchDateObj, 7);

    let match = await prisma.match.findFirst({
      where: {
        OR: [
          {
            homeTeamId: homeTeamId,
            awayTeamId: awayTeamId,
          },
          {
            homeTeamId: awayTeamId,
            awayTeamId: homeTeamId,
          },
        ],
        date: {
          gte: dateRangeStart,
          lte: dateRangeEnd,
        },
      },
    });

    if (!match) {
      match = await prisma.match.create({
        data: {
          homeTeam: {
            connect: {
              id: homeTeamId,
            }
          },
          awayTeam: {
            connect: {
              id: awayTeamId,
            }
          },
          ...stadiumId ? {
            stadium: {
              connect: {
                id: stadiumId,
              }
            }
          } : {},
          competition: {
            connect: {
              id: selectedCompetition,
            }
          },
          ...season ? {
            season: {
              connect: {
                id: season.id,
              }
            }
          } : {},
          date: matchDateObj,
          homeScore,
          awayScore,
        },
      });
    }

    const matchVisit = await prisma.matchVisit.create({
      data: {
        userId,
        matchId: match.id,
        review,
      },
    });

    return NextResponse.json(matchVisit, { status: 201 });
  } 
  catch (error) {
    console.error('[POST_MATCH_VISIT]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}