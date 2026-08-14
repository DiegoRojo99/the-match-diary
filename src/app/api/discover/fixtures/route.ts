import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiFootballService } from '@/lib/api-football';
import type {
  DiscoverCompetitionSummary,
  DiscoverFixtureApiResponse,
  DiscoverFixtureNormalized,
} from '@/types';

function normalizeFixture(fixture: DiscoverFixtureApiResponse): DiscoverFixtureNormalized {
  return {
    id: fixture.fixture?.id ?? null,
    date: fixture.fixture?.date ?? null,
    status: {
      short: fixture.fixture?.status?.short ?? null,
      long: fixture.fixture?.status?.long ?? null,
    },
    homeTeam: {
      id: fixture.teams?.home?.id ?? null,
      name: fixture.teams?.home?.name ?? null,
      logoUrl: fixture.teams?.home?.logo ?? null,
    },
    awayTeam: {
      id: fixture.teams?.away?.id ?? null,
      name: fixture.teams?.away?.name ?? null,
      logoUrl: fixture.teams?.away?.logo ?? null,
    },
    venue: fixture.fixture?.venue
      ? {
          id: fixture.fixture.venue.id ?? null,
          name: fixture.fixture.venue.name ?? null,
          city: fixture.fixture.venue.city ?? null,
        }
      : null,
    competition: {
      id: fixture.league?.id ?? null,
      name: fixture.league?.name ?? null,
      logoUrl: fixture.league?.logo ?? null,
      country: fixture.league?.country ?? null,
    },
    goals: {
      home: fixture.goals?.home ?? null,
      away: fixture.goals?.away ?? null,
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const competitionIdParam = searchParams.get('competitionId');
    const limitParam = searchParams.get('limit');
    const from = searchParams.get('from') ?? new Date().toISOString().slice(0, 10);
    const to =
      searchParams.get('to') ??
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString().slice(0, 10);

    const limit = Number(limitParam ?? 12);
    const season = new Date().getFullYear();

    const competitionId = competitionIdParam ? Number(competitionIdParam) : null;

    const competitions = competitionId
      ? await prisma.competition.findMany({
          where: { id: competitionId, visible: true },
          include: { country: true },
          orderBy: { name: 'asc' },
        })
      : await prisma.competition.findMany({
          where: { visible: true },
          include: { country: true },
          orderBy: { name: 'asc' },
          take: 8,
        });

    const competitionSummaries: DiscoverCompetitionSummary[] = competitions.map((competition) => ({
      id: competition.id,
      name: competition.name,
      type: competition.type,
      logoUrl: competition.logoUrl,
      country: competition.country,
    }));

    if (!competitions.length) {
      return NextResponse.json({ competitions: [], fixtures: [] });
    }

    const fixtureBatches = await Promise.all(
      competitions.map(async (competition) => {
        try {
          const fixtures = await apiFootballService.getFixtures(
            competition.id,
            season,
            from,
            to
          );

          return fixtures.map(normalizeFixture).slice(0, 10);
        } catch (error) {
          console.error(`Error loading fixtures for competition ${competition.id}:`, error);
          return [];
        }
      })
    );

    const fixtures = fixtureBatches
      .flat()
      .sort(sortByDate)
      .slice(0, Number.isFinite(limit) ? limit : 12);

    return NextResponse.json({
      competitions: competitionSummaries,
      fixtures,
    });
  } 
  catch (error) {
    console.error('Error fetching discover fixtures:', error);
    return NextResponse.json({ error: 'Failed to load fixtures' }, { status: 500 });
  }
}

function sortByDate(a: DiscoverFixtureNormalized, b: DiscoverFixtureNormalized): number {
  if (!a.date && !b.date) return 0;
  if (!a.date) return 1;
  if (!b.date) return -1;
  const dateA = new Date(a.date);
  const dateB = new Date(b.date);
  return dateA.getTime() - dateB.getTime();
}