import { prisma } from '@/lib/prisma';
import { discoverApiFixtureResponseToMatchData } from '@/types/dto/match';
import type { DiscoverFixtureApiResponse, DiscoverFixtureDatabaseMatch } from '@/types';
import { upsertCompetition } from '@/lib/db/competitions';
import { upsertTeam } from '@/lib/db/teams';
import { upsertVenue } from '@/lib/db/venues';

export async function findDiscoverFixturesByDate({
  season,
  competitionId,
  from,
  to,
  limit,
}: {
  season: number;
  competitionId: number | null;
  from: string;
  to: string;
  limit: number;
}): Promise<DiscoverFixtureDatabaseMatch[]> {
  const dateFrom = new Date(from);
  const dateTo = new Date(to);
  dateTo.setHours(23, 59, 59, 999);

  return (await prisma.match.findMany({
    where: {
      seasonYear: season,
      ...(competitionId ? { competitionId } : {}),
      matchDate: {
        gte: dateFrom,
        lte: dateTo,
      },
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      venue: true,
      competition: {
        include: { country: true },
      },
    },
    take: limit,
    orderBy: { matchDate: 'asc' },
  })) as DiscoverFixtureDatabaseMatch[];
}

export async function saveApiFixtureToDatabase(response: DiscoverFixtureApiResponse): Promise<void> {
  const fixture = response.fixture;
  if (!fixture?.id) return;

  const homeTeamInput = response.teams?.home;
  const awayTeamInput = response.teams?.away;
  const leagueInput = response.league;
  const venueInput = fixture.venue;
  if (!homeTeamInput?.id || !awayTeamInput?.id || !leagueInput?.id) return;

  const homeTeam = await upsertTeam({
    id: homeTeamInput.id,
    name: homeTeamInput.name,
    logo: homeTeamInput.logo,
  });

  const awayTeam = await upsertTeam({
    id: awayTeamInput.id,
    name: awayTeamInput.name,
    logo: awayTeamInput.logo,
  });

  if (!homeTeam || !awayTeam) return;
  const venue = venueInput?.id
    ? await upsertVenue({
        id: venueInput.id,
        name: venueInput.name,
        city: venueInput.city,
      })
    : null;

  const competition = await upsertCompetition({
    id: leagueInput.id,
    name: leagueInput.name,
    logo: leagueInput.logo,
    type: 'league',
  });

  if (!competition) return;

  const matchSeasonYear = typeof leagueInput.season === 'number' && Number.isFinite(leagueInput.season)
      ? leagueInput.season
      : new Date(fixture.date ?? Date.now()).getFullYear();

  const matchData = {
    id: fixture.id,
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    venueId: venue?.id ?? null,
    competitionId: competition.id,
    seasonYear: matchSeasonYear,
    matchDate: new Date(fixture.date ?? Date.now()),
    homeScore: response.goals?.home ?? null,
    awayScore: response.goals?.away ?? null,
    statusShort: fixture.status?.short ?? null,
    statusLong: fixture.status?.long ?? null,
    matchWeek: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await prisma.match.upsert({
    where: { id: fixture.id },
    update: matchData,
    create: matchData,
  });
}

export async function getFixtureByIdFromDb(matchId: number) {
  return prisma.match.findUnique({
    where: { id: matchId },
    include: {
      homeTeam: true,
      awayTeam: true,
      venue: true,
      competition: true,
    },
  });
}

export async function saveMatchFromApiFixture(response: DiscoverFixtureApiResponse): Promise<void> {
  const fixture = response.fixture;
  if (!fixture?.id) return;
  
  const matchData = discoverApiFixtureResponseToMatchData(response);
  if (!matchData) return;
  if (!matchData.id) return;
  await prisma.match.upsert({
    where: { id: matchData.id },
    update: matchData,
    create: matchData,
  });
}
