import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserDataFromRequest, ensureUserExists } from '@/lib/server-auth';
import { IdRouteParams } from '@/types/api/params';
import { apiFootballService } from '@/lib/api-football';
import { CombinedMatchResponse, MatchWithDetailsSerialized, UserMatchSerialized } from '@/types/prisma/match';
import { apiFixtureToMatchData } from '@/types/dto/match';
import { Match, UserMatch, Team, Competition, Venue } from '@prisma/client';

// Serialization helpers
function serializeMatch(match: Match & {
  homeTeam: Team | null;
  awayTeam: Team | null;
  competition: Competition | null;
  venue: (Venue & { city: { name: string } | null }) | null;
}): MatchWithDetailsSerialized {
  return {
    ...match,
    matchDate: match.matchDate.toISOString(),
    createdAt: match.createdAt.toISOString(),
    updatedAt: match.updatedAt.toISOString(),
  };
}

function serializeUserMatch(userMatch: UserMatch): UserMatchSerialized {
  return {
    ...userMatch,
    attendedDate: userMatch.attendedDate.toISOString(),
    createdAt: userMatch.createdAt.toISOString(),
    updatedAt: userMatch.updatedAt.toISOString(),
  };
}

export async function GET(
  request: NextRequest,
  { params }: IdRouteParams
) {
  try {
    const { id } = await params;
    const matchId = parseInt(id);

    if (isNaN(matchId)) {
      return NextResponse.json({ error: 'Invalid match ID' }, { status: 400 });
    }

    // Get user data if authenticated
    const userData = await getUserDataFromRequest(request);
    let userId: string | null = null;

    if (userData) {
      // Ensure user exists in our local database
      await ensureUserExists(userData);
      userId = userData.id;
    }

    // Fetch match details (try DB first, then API)
    let match = await prisma.match.findUnique({
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

    // If not found in DB, fetch from API
    if (!match) {
      const fixtures = await apiFootballService.getFixtureById(matchId);
      
      if (!fixtures || fixtures.length === 0) {
        return NextResponse.json({ error: 'Match not found' }, { status: 404 });
      }

      const fixture = fixtures[0];
      
      // Save to database for future use (same logic as existing /api/matches/[id] route)
      const fixtureHomeTeam = fixture.teams.home;
      const fixtureAwayTeam = fixture.teams.away;
      const fixtureVenue = fixture.fixture.venue;
      const fixtureLeague = fixture.league;

      try {
        // Upsert teams
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

        match = await prisma.match.upsert({
          where: { id: fixture.fixture.id },
          update: matchData,
          create: { id: fixture.fixture.id, ...matchData },
          include: {
            homeTeam: true,
            awayTeam: true,
            venue: {
              include: {
                city: true
              }
            },
            competition: true,
          },
        });
      } catch (saveError) {
        console.error('Error saving fixture to database:', saveError);
        return NextResponse.json({ error: 'Failed to save match data' }, { status: 500 });
      }
    }

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Fetch user visit if user is authenticated
    let userVisit = null;
    if (userId) {
      userVisit = await prisma.userMatch.findUnique({
        where: {
          userId_matchId: {
            userId,
            matchId: parseInt(id)
          }
        }
      });
    }

    const response: CombinedMatchResponse = {
      match: serializeMatch(match),
      userVisit: userVisit ? serializeUserMatch(userVisit) : null
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching match with user visit:', error);

    if (error instanceof Error && error.message.includes('API request failed')) {
      return NextResponse.json({ error: 'Failed to fetch match from API' }, { status: 503 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}