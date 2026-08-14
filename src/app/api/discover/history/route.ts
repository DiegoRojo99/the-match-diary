import { NextRequest, NextResponse } from 'next/server';
import { apiFootballService } from '@/lib/api-football';
import { prisma } from '@/lib/prisma';
import { saveApiFixtureToDatabase, searchHistoricalFixtures } from '@/lib/db';
import { normalizeDbFixture, normalizeFixture, sortDiscoverFixtures } from '@/types/dto/discover';
import type { ApiFixture } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const competitionId = searchParams.get('competitionId');
    const country = searchParams.get('country');
    const season = searchParams.get('season');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = Number(searchParams.get('limit') ?? '30');

    const filters = {
      teamId: teamId ? Number(teamId) : null,
      competitionId: competitionId ? Number(competitionId) : null,
      country: country && country !== 'all' ? country : null,
      season: season ? Number(season) : null,
      from,
      to,
      limit,
    };

    const dbMatches = await searchHistoricalFixtures(filters);
    if (dbMatches.length > 0) {
      return NextResponse.json({
        fixtures: dbMatches.map(normalizeDbFixture).slice(0, limit),
      });
    }

    if (!filters.teamId && !filters.competitionId && !filters.country && !filters.season && !filters.from && !filters.to) {
      return NextResponse.json({ fixtures: [] });
    }

    let apiFixtures: ApiFixture[] = [];

    if (filters.teamId) {
      const teamFixtures = await apiFootballService.getTeamFixtures(
        filters.teamId,
        filters.season ?? undefined,
        undefined,
        undefined
      );

      apiFixtures = teamFixtures.filter((fixture) => {
        const matchDate = new Date(fixture.fixture.date);
        const passesCompetition = !filters.competitionId || fixture.league.id === filters.competitionId;
        const passesSeason = !filters.season || fixture.league.season === filters.season;
        const passesCountry = !filters.country || fixture.league.country?.toLowerCase() === filters.country.toLowerCase();
        const passesFrom = !filters.from || matchDate >= new Date(filters.from);
        const passesTo = !filters.to || matchDate <= new Date(`${filters.to}T23:59:59.999Z`);
        return passesCompetition && passesSeason && passesCountry && passesFrom && passesTo;
      });
    } else if (filters.competitionId) {
      const competition = await prisma.competition.findUnique({
        where: { id: filters.competitionId },
      });

      if (!competition) {
        return NextResponse.json({ fixtures: [] });
      }

      apiFixtures = await apiFootballService.getFixtures(
        filters.competitionId,
        filters.season ?? new Date().getFullYear(),
        filters.from ?? undefined,
        filters.to ?? undefined
      );

      if (filters.country) {
        apiFixtures = apiFixtures.filter((fixture) => (
          fixture.league.country?.toLowerCase() === filters.country?.toLowerCase()
        ));
      }
    } else if (filters.country) {
      const leagues = await apiFootballService.getLeagues(filters.country, filters.season ?? undefined);
      const competitionIds = leagues
        .map((league) => league.league?.id)
        .filter((id): id is number => typeof id === 'number');

      if (competitionIds.length === 0) {
        return NextResponse.json({ fixtures: [] });
      }

      const countryFixtures = await Promise.all(
        competitionIds.map((competitionId) => apiFootballService.getFixtures(
          competitionId,
          filters.season ?? undefined,
          filters.from ?? undefined,
          filters.to ?? undefined
        ))
      );

      apiFixtures = countryFixtures.flat();
    } else {
      apiFixtures = [];
    }

    const uniqueFixtures = apiFixtures
      .filter((fixture) => fixture?.fixture?.id)
      .filter((fixture, index, all) => all.findIndex((item) => item.fixture.id === fixture.fixture.id) === index)
      .slice(0, limit);

    await Promise.all(uniqueFixtures.map((fixture) => saveApiFixtureToDatabase(fixture)));

    const normalized = uniqueFixtures.map(normalizeFixture).sort(sortDiscoverFixtures).slice(0, limit);

    return NextResponse.json({ fixtures: normalized });
  } catch (error) {
    console.error('Error fetching historical fixtures:', error);
    return NextResponse.json({ error: 'Failed to load historical fixtures' }, { status: 500 });
  }
}
