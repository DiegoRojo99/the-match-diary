import { NextRequest, NextResponse } from 'next/server';
import { apiFootballService } from '@/lib/api-football';
import { prisma } from '@/lib/prisma';
import { IdRouteParams } from '@/types/api/params';
import { apiFixtureToMatchData } from '@/types/dto/match';
import { MatchWithDetails } from '@/types/prisma/match';

async function syncFixtureDetailsFromApi(matchId: number): Promise<MatchWithDetails | null> {
  const fixtures = await apiFootballService.getFixtureById(matchId);
  if (!fixtures || fixtures.length === 0) return null;
  const fixture = fixtures[0];
  const fixtureHomeTeam = fixture.teams.home;
  const fixtureAwayTeam = fixture.teams.away;
  const fixtureVenue = fixture.fixture.venue;
  const fixtureLeague = fixture.league;

  const homeTeam = await prisma.team.upsert({
    where: { id: fixtureHomeTeam.id },
    update: { name: fixtureHomeTeam.name, logoUrl: fixtureHomeTeam.logo, updatedAt: new Date() },
    create: { id: fixtureHomeTeam.id, name: fixtureHomeTeam.name, logoUrl: fixtureHomeTeam.logo, createdAt: new Date(), updatedAt: new Date() },
    include: { homeVenue: true },
  });

  const awayTeam = await prisma.team.upsert({
    where: { id: fixtureAwayTeam.id },
    update: { name: fixtureAwayTeam.name, logoUrl: fixtureAwayTeam.logo, updatedAt: new Date() },
    create: { id: fixtureAwayTeam.id, name: fixtureAwayTeam.name, logoUrl: fixtureAwayTeam.logo, createdAt: new Date(), updatedAt: new Date() },
  });

  let venue = null;
  if (fixtureVenue && fixtureVenue.id) {
    venue = await prisma.venue.upsert({
      where: { id: fixtureVenue.id },
      update: { name: fixtureVenue.name || 'Unknown Venue', city: fixtureVenue.city || null, updatedAt: new Date() },
      create: { id: fixtureVenue.id, name: fixtureVenue.name || 'Unknown Venue', city: fixtureVenue.city || null, createdAt: new Date(), updatedAt: new Date() },
    });
  }

  const competition = await prisma.competition.upsert({
    where: { id: fixtureLeague.id },
    update: { name: fixtureLeague.name, logoUrl: fixtureLeague.logo, type: 'league', updatedAt: new Date() },
    create: { id: fixtureLeague.id, name: fixtureLeague.name, logoUrl: fixtureLeague.logo, type: 'league', createdAt: new Date(), updatedAt: new Date() },
  });

  const matchData = apiFixtureToMatchData(fixture);
  const fallbackVenueId = !matchData.venueId && homeTeam.homeVenueId ? homeTeam.homeVenueId : matchData.venueId;
  const matchObject = await prisma.match.upsert({
    where: { id: fixture.fixture.id },
    update: { ...matchData, venueId: fallbackVenueId },
    create: { ...matchData, venueId: fallbackVenueId },
  });

  return {
    ...matchObject,
    homeTeam,
    awayTeam,
    venue,
    competition,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: IdRouteParams
) {
  try {
    const { id } = await params;
    const matchId = parseInt(id);
    if (isNaN(matchId)) return NextResponse.json({ error: 'Invalid match ID' }, { status: 400 });

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: true,
        awayTeam: true,
        venue: true,
        competition: true,
      },
    }) as MatchWithDetails | null;

    if (match) {
      const hasMissingDetails =
        match.homeTeamId == null ||
        match.awayTeamId == null ||
        match.competitionId == null ||
        match.venueId == null ||
        !match.homeTeam ||
        !match.awayTeam ||
        !match.competition ||
        !match.venue;

      if (!hasMissingDetails) return NextResponse.json(match);

      try {
        const refreshedMatch = await syncFixtureDetailsFromApi(matchId);
        if (refreshedMatch) return NextResponse.json(refreshedMatch);
      } 
      catch (syncError) {
        console.error('Error refreshing missing match details:', syncError);
      }

      return NextResponse.json(match);
    }

    const refreshedMatch = await syncFixtureDetailsFromApi(matchId);
    if (refreshedMatch) return NextResponse.json(refreshedMatch);
    return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching match details:', error);

    if (error instanceof Error && error.message.includes('API request failed')) {
      return NextResponse.json({ error: 'Failed to fetch match from API' }, { status: 503 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
