import { NextRequest, NextResponse } from 'next/server';
import { apiFootballService } from '@/lib/api-football';
import { prisma } from '@/lib/prisma';
import { IdRouteParams } from '@/types/api/params';
import { ApiFixture } from '@/types/api/matches';

export interface MatchDetailResponse {
  id: number;
  home_team: {
    id: number;
    name: string;
    logo: string | null;
  } | null;
  away_team: {
    id: number;
    name: string;
    logo: string | null;
  } | null;
  home_score: number | null;
  away_score: number | null;
  venue: {
    id: number;
    name: string;
    city: string | null;
    capacity: number | null;
  } | null;
  competition: {
    id: number;
    name: string;
    logo: string | null;
  } | null;
  season: number;
  round: string | null;
  match_date: string;
  status: string | null;
  status_long: string | null;
}

function formatDbMatch(match: {
  id: number;
  homeTeam: { id: number; name: string; logoUrl: string | null } | null;
  awayTeam: { id: number; name: string; logoUrl: string | null } | null;
  homeScore: number | null;
  awayScore: number | null;
  venue: {
    id: number;
    name: string;
    capacity: number | null;
    city: { name: string } | null;
  } | null;
  competition: { id: number; name: string; logoUrl: string | null } | null;
  seasonYear: number;
  matchWeek: number | null;
  matchDate: Date;
  statusShort: string | null;
  statusLong: string | null;
}): MatchDetailResponse {
  return {
    id: match.id,
    home_team: match.homeTeam
      ? { id: match.homeTeam.id, name: match.homeTeam.name, logo: match.homeTeam.logoUrl }
      : null,
    away_team: match.awayTeam
      ? { id: match.awayTeam.id, name: match.awayTeam.name, logo: match.awayTeam.logoUrl }
      : null,
    home_score: match.homeScore,
    away_score: match.awayScore,
    venue: match.venue
      ? {
          id: match.venue.id,
          name: match.venue.name,
          city: match.venue.city?.name ?? null,
          capacity: match.venue.capacity,
        }
      : null,
    competition: match.competition
      ? { id: match.competition.id, name: match.competition.name, logo: match.competition.logoUrl }
      : null,
    season: match.seasonYear,
    round: match.matchWeek != null ? `Round ${match.matchWeek}` : null,
    match_date: match.matchDate.toISOString(),
    status: match.statusShort,
    status_long: match.statusLong,
  };
}

function formatApiFixture(fixture: ApiFixture): MatchDetailResponse {
  return {
    id: fixture.fixture.id,
    home_team: {
      id: fixture.teams.home.id,
      name: fixture.teams.home.name,
      logo: fixture.teams.home.logo,
    },
    away_team: {
      id: fixture.teams.away.id,
      name: fixture.teams.away.name,
      logo: fixture.teams.away.logo,
    },
    home_score: fixture.goals.home,
    away_score: fixture.goals.away,
    venue: fixture.fixture.venue
      ? {
          id: fixture.fixture.venue.id,
          name: fixture.fixture.venue.name,
          city: fixture.fixture.venue.city,
          capacity: null,
        }
      : null,
    competition: {
      id: fixture.league.id,
      name: fixture.league.name,
      logo: fixture.league.logo,
    },
    season: fixture.league.season,
    round: fixture.league.round,
    match_date: fixture.fixture.date,
    status: fixture.fixture.status.short,
    status_long: fixture.fixture.status.long,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: IdRouteParams
) {
  try {
    const { id } = await params;
    const matchId = parseInt(id);

    if (isNaN(matchId)) {
      return NextResponse.json({ error: 'Invalid match ID' }, { status: 400 });
    }

    // Try DB first
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: true,
        awayTeam: true,
        venue: {
          include: { city: true },
        },
        competition: true,
      },
    });

    if (match) {
      return NextResponse.json(formatDbMatch(match));
    }

    // Fallback to API
    const fixtures = await apiFootballService.getFixtureById(matchId);

    if (!fixtures || fixtures.length === 0) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const fixture = fixtures[0];

    // Save the fixture and related entities to DB for future requests
    try {
      const fixtureHomeTeam = fixture.teams.home;
      const fixtureAwayTeam = fixture.teams.away;
      const fixtureVenue = fixture.fixture.venue;
      const fixtureLeague = fixture.league;

      await prisma.team.upsert({
        where: { id: fixtureHomeTeam.id },
        update: { name: fixtureHomeTeam.name, logoUrl: fixtureHomeTeam.logo, updatedAt: new Date() },
        create: { id: fixtureHomeTeam.id, name: fixtureHomeTeam.name, logoUrl: fixtureHomeTeam.logo, createdAt: new Date(), updatedAt: new Date() },
      });

      await prisma.team.upsert({
        where: { id: fixtureAwayTeam.id },
        update: { name: fixtureAwayTeam.name, logoUrl: fixtureAwayTeam.logo, updatedAt: new Date() },
        create: { id: fixtureAwayTeam.id, name: fixtureAwayTeam.name, logoUrl: fixtureAwayTeam.logo, createdAt: new Date(), updatedAt: new Date() },
      });

      let venueId: number | null = null;
      if (fixtureVenue && fixtureVenue.id) {
        const venue = await prisma.venue.upsert({
          where: { id: fixtureVenue.id },
          update: { name: fixtureVenue.name || 'Unknown Venue', updatedAt: new Date() },
          create: { id: fixtureVenue.id, name: fixtureVenue.name || 'Unknown Venue', createdAt: new Date(), updatedAt: new Date() },
        });
        venueId = venue.id;
      }

      const competition = await prisma.competition.upsert({
        where: { id: fixtureLeague.id },
        update: { name: fixtureLeague.name, logoUrl: fixtureLeague.logo, updatedAt: new Date() },
        create: { id: fixtureLeague.id, name: fixtureLeague.name, logoUrl: fixtureLeague.logo, type: 'league', createdAt: new Date(), updatedAt: new Date() },
      });

      const matchWeekParsed = parseInt(fixtureLeague.round.replace(/\D/g, ''));
      const matchWeek: number | null = isNaN(matchWeekParsed) ? null : matchWeekParsed;
      const matchData = {
        homeTeamId: fixtureHomeTeam.id,
        awayTeamId: fixtureAwayTeam.id,
        venueId,
        competitionId: competition.id,
        seasonYear: fixtureLeague.season,
        matchDate: new Date(fixture.fixture.date),
        homeScore: fixture.goals.home,
        awayScore: fixture.goals.away,
        statusShort: fixture.fixture.status.short,
        statusLong: fixture.fixture.status.long,
        matchWeek,
      };

      await prisma.match.upsert({
        where: { id: fixture.fixture.id },
        update: matchData,
        create: { id: fixture.fixture.id, ...matchData },
      });
    } catch (saveError) {
      console.error('Error saving fixture to database:', saveError);
    }

    return NextResponse.json(formatApiFixture(fixture));
  } catch (error) {
    console.error('Error fetching match details:', error);

    if (error instanceof Error && error.message.includes('API request failed')) {
      return NextResponse.json({ error: 'Failed to fetch match from API' }, { status: 503 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
