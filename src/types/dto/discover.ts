import type {
  DiscoverCompetitionSummary,
  DiscoverFixtureApiResponse,
  DiscoverFixtureDatabaseMatch,
  DiscoverFixtureNormalized,
} from '@/types';

export function normalizeFixture(fixture: DiscoverFixtureApiResponse): DiscoverFixtureNormalized {
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

export function normalizeDbFixture(match: DiscoverFixtureDatabaseMatch): DiscoverFixtureNormalized {
  return {
    id: match.id,
    date: match.matchDate.toISOString(),
    status: {
      short: match.statusShort ?? null,
      long: match.statusLong ?? null,
    },
    homeTeam: {
      id: match.homeTeam?.id ?? null,
      name: match.homeTeam?.name ?? null,
      logoUrl: match.homeTeam?.logoUrl ?? null,
    },
    awayTeam: {
      id: match.awayTeam?.id ?? null,
      name: match.awayTeam?.name ?? null,
      logoUrl: match.awayTeam?.logoUrl ?? null,
    },
    venue: match.venue
      ? {
          id: match.venue.id,
          name: match.venue.name,
          city: match.venue.city ?? null,
        }
      : null,
    competition: {
      id: match.competition?.id ?? null,
      name: match.competition?.name ?? null,
      logoUrl: match.competition?.logoUrl ?? null,
      country: match.competition?.country?.name ?? null,
    },
    goals: {
      home: match.homeScore ?? null,
      away: match.awayScore ?? null,
    },
  };
}

export function sortDiscoverFixtures(
  a: DiscoverFixtureNormalized,
  b: DiscoverFixtureNormalized
): number {
  if (!a.date && !b.date) return 0;
  if (!a.date) return 1;
  if (!b.date) return -1;

  const dateA = new Date(a.date).getTime();
  const dateB = new Date(b.date).getTime();
  return dateA - dateB;
}

export function createDiscoverCompetitionSummaries(
  competitions: { id: number; name: string; type: string; logoUrl: string | null; country: DiscoverCompetitionSummary['country'] }[]
): DiscoverCompetitionSummary[] {
  return competitions.map((competition) => ({
    id: competition.id,
    name: competition.name,
    type: competition.type,
    logoUrl: competition.logoUrl,
    country: competition.country,
  }));
}
