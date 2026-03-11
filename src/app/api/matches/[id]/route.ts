import { NextRequest, NextResponse } from 'next/server';
import { apiFootballService } from '@/lib/api-football';
import { prisma } from '@/lib/prisma';
import { IdRouteParams } from '@/types/api/params';
import { apiFixtureToMatchData } from '@/types/dto/match';
import { MatchWithDetails } from '@/types/prisma/match';

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
        venue: true,
        competition: true,
      },
    }) as MatchWithDetails | null;
    if (match) return NextResponse.json(match);

    // Fallback to API
    const fixtures = await apiFootballService.getFixtureById(matchId);
    if (!fixtures || fixtures.length === 0) return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    const fixture = fixtures[0];

    // Save the fixture and related entities to DB for future requests
    try {
      const fixtureHomeTeam = fixture.teams.home;
      const fixtureAwayTeam = fixture.teams.away;
      const fixtureVenue = fixture.fixture.venue;
      const fixtureLeague = fixture.league;

      const homeTeam = await prisma.team.upsert({
        where: { id: fixtureHomeTeam.id },
        update: { name: fixtureHomeTeam.name, logoUrl: fixtureHomeTeam.logo, updatedAt: new Date() },
        create: { id: fixtureHomeTeam.id, name: fixtureHomeTeam.name, logoUrl: fixtureHomeTeam.logo, createdAt: new Date(), updatedAt: new Date() },
      });

      const awayTeam = await prisma.team.upsert({
        where: { id: fixtureAwayTeam.id },
        update: { name: fixtureAwayTeam.name, logoUrl: fixtureAwayTeam.logo, updatedAt: new Date() },
        create: { id: fixtureAwayTeam.id, name: fixtureAwayTeam.name, logoUrl: fixtureAwayTeam.logo, createdAt: new Date(), updatedAt: new Date() },
      });

      let venueId: number | null = null;
      let venue = null;
      if (fixtureVenue && fixtureVenue.id) {
        venue = await prisma.venue.upsert({
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

      const matchData = apiFixtureToMatchData(fixture);
      const matchObject = await prisma.match.upsert({
        where: { id: fixture.fixture.id },
        update: matchData,
        create: matchData,
      });
    
      
      const formattedFixture: MatchWithDetails = {
        ...matchObject,
        homeTeam,
        awayTeam,
        venue,
        competition,
      }

      return NextResponse.json(formattedFixture);
    } 
    catch (saveError) {
      console.error('Error saving fixture to database:', saveError);
      
      // Even if saving fails, we can still return the API data
      const matchData = apiFixtureToMatchData(fixture);
      const formattedFixture: MatchWithDetails = {
        ...matchData,
        homeTeam: null,
        awayTeam: null,
        venue: null,
        competition: null,
      };
      
      return NextResponse.json(formattedFixture);
    }
  } 
  catch (error) {
    console.error('Error fetching match details:', error);

    if (error instanceof Error && error.message.includes('API request failed')) {
      return NextResponse.json({ error: 'Failed to fetch match from API' }, { status: 503 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
