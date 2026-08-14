import { Competition, Match, Team, Venue } from "@prisma/client";
import { ApiFixture, DiscoverFixtureApiResponse } from "../api";

export function apiFixtureToMatchData(apiFixture: ApiFixture): Match {
  const homeTeam = apiFixture.teams.home;
  const awayTeam = apiFixture.teams.away;
  const league = apiFixture.league;
  const matchWeek: number | null = parseInt(league.round.replace(/\D/g, '')) || null;
  const goals = apiFixture.goals;
  const fixture = apiFixture.fixture;

  return {
    id: fixture.id,
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
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function discoverApiFixtureResponseToMatchData(response: DiscoverFixtureApiResponse): Match | null {
  const teams = response.teams;
  if (!teams) return null;
  const homeTeam = teams.home;
  const awayTeam = teams.away;
  if (!homeTeam?.id || !awayTeam?.id) return null;

  const fixture = response.fixture;
  if (!fixture || !fixture.id || !fixture.date || !fixture.status) return null;
  let status = fixture.status;
  if (!status.short) status.short = null;
  if (!status.long) status.long = null;

  const league = response.league;
  if (!league || !league.id || !league.season) return null;
  const leagueRound = league?.round ?? '';
  const matchWeek: number | null = parseInt(leagueRound.replace(/\D/g, '')) || null;

  let goals = response.goals;
  if (!goals) goals = { home: null, away: null };
  if (goals.home === undefined) goals.home = null;
  if (goals.away === undefined) goals.away = null;

  return {
    id: fixture.id,
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    venueId: fixture.venue?.id ?? null,
    competitionId: league.id ?? null,
    seasonYear: league.season,
    matchDate: new Date(fixture.date),
    homeScore: goals.home,
    awayScore: goals.away,
    statusShort: status.short,
    statusLong: status.long,
    matchWeek: matchWeek,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

type SimpleMatchWithDetails = Match & {
  homeTeam: Team | null;
  awayTeam: Team | null;
  competition: Competition | null;
  venue: Venue | null;
};

export function transformMatchWithDetails(match: Match, homeTeam: Team | null, awayTeam: Team | null, competition: Competition | null, venue: Venue | null): SimpleMatchWithDetails {
  return {
    ...match,
    homeTeam: homeTeam,
    awayTeam: awayTeam,
    competition: competition,
    venue: venue
  };
}