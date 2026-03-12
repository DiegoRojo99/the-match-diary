import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { IdRouteParams } from '@/types/api/params';

export async function GET(
  request: NextRequest,
  { params }: IdRouteParams
) {
  try {
    const { id } = await params;
    const competitionId = parseInt(id);

    if (isNaN(competitionId)) {
      return NextResponse.json({ error: 'Invalid competition ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const seasonParam = searchParams.get('season');
    const matchweekParam = searchParams.get('matchweek');

    const season = seasonParam ? parseInt(seasonParam) : null;
    const matchweek = matchweekParam ? parseInt(matchweekParam) : null;

    // Check competition exists
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
      select: { id: true, name: true },
    });

    if (!competition) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    }

    const where: Record<string, unknown> = { competitionId };

    if (season !== null && !isNaN(season)) {
      where.seasonYear = season;
    }

    if (matchweek !== null && !isNaN(matchweek)) {
      where.matchWeek = matchweek;
    }

    const matches = await prisma.match.findMany({
      where,
      include: {
        homeTeam: true,
        awayTeam: true,
        venue: true,
        competition: true,
      },
      orderBy: [{ matchDate: 'asc' }, { matchWeek: 'asc' }],
      take: 100,
    });

    // Get distinct matchweeks for this competition/season to populate the selector
    const matchweeks = await prisma.match.findMany({
      where: {
        competitionId,
        ...(season !== null && !isNaN(season) ? { seasonYear: season } : {}),
        matchWeek: { not: null },
      },
      select: { matchWeek: true },
      distinct: ['matchWeek'],
      orderBy: { matchWeek: 'asc' },
    });

    return NextResponse.json({
      matches,
      matchweeks: matchweeks
        .map((m: { matchWeek: number | null }) => m.matchWeek)
        .filter((mw: number | null): mw is number => mw !== null),
    });
  } catch (error) {
    console.error('Error in competition matches API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
