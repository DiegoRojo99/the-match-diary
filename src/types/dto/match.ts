import { Match } from "@prisma/client";
import { ApiFixture } from "../api";

export function apiFixtureToMatchData(apiFixture: ApiFixture): Omit<Match, 'id'> {
  const homeTeam = apiFixture.teams.home;
  const awayTeam = apiFixture.teams.away;
  const league = apiFixture.league;
  const matchWeek: number | null = parseInt(league.round.replace(/\D/g, '')) || null;
  const goals = apiFixture.goals;
  const fixture = apiFixture.fixture;

  return {
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    venueId: fixture.venue?.id ?? null,
    competitionId: league.id ?? null,
    seasonYear: league.season,
    matchDate: new Date(fixture.date),
    homeScore: goals.home,
    awayScore: goals.away,
    statusShort: fixture.status.short,
    statusLong: fixture.status.long,
    matchWeek: matchWeek,
    apiId: fixture.id,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}