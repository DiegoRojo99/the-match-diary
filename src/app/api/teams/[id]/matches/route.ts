import { NextRequest, NextResponse } from 'next/server';
import { apiFootballService } from '@/lib/api-football';
import { Competition, Match, prisma, Team, Venue } from '@/lib/prisma';
import { IdRouteParams } from '@/types/api/params';
import { apiFixtureToMatchData, transformMatchWithDetails } from '@/types/dto/match';
import { MatchWithDetails } from '@/types/prisma/match';

// Simple type for this endpoint that doesn't need venue city info
type SimpleMatchWithDetails = Match & {
  homeTeam: Team | null;
  awayTeam: Team | null;
  competition: Competition | null;
  venue: Venue | null;
};

export async function GET(
  request: NextRequest,
  { params }: IdRouteParams
) {
  try {
    const { id } = await params;
    const teamId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season');
    const last = searchParams.get('last');
    const next = searchParams.get('next');
    
    if (isNaN(teamId)) {
      return NextResponse.json(
        { error: 'Invalid team ID' },
        { status: 400 }
      );
    }

    // First check if the team exists
    const team = await prisma.team.findUnique({
      where: {
        id: teamId
      },
      select: {
        id: true,
        name: true
      }
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Fetch fixtures from Football API
    // Default to current season (2025) and last 10 matches if no params specified
    const currentSeason = season ? parseInt(season) : 2025;
    const lastMatches = last ? parseInt(last) : (next ? undefined : 10);
    const nextMatches = next ? parseInt(next) : undefined;
    
    console.log('Fetching fixtures for team:', {
      teamApiId: team.id,
      season: currentSeason,
      last: lastMatches,
      next: nextMatches
    });

    const fixtures = await apiFootballService.getTeamFixtures(
      team.id,
      currentSeason,
      lastMatches,
      nextMatches
    );

    console.log('API returned fixtures count:', fixtures.length);
    let matchesWithDetails: SimpleMatchWithDetails[] = [];

    // Always save matches and related entities to database
    try {
      // For each fixture, ensure all related entities exist and save the match
      const savePromises = fixtures.map(async (fixture) => {
        try {
          // Upsert home team
          const fixtureHomeTeam = fixture.teams.home;
          const homeTeam = await prisma.team.upsert({
            where: { id: fixtureHomeTeam.id },
            update: {
              name: fixtureHomeTeam.name,
              logoUrl: fixtureHomeTeam.logo,
              updatedAt: new Date()
            },
            create: {
              id: fixtureHomeTeam.id,
              name: fixtureHomeTeam.name,
              logoUrl: fixtureHomeTeam.logo,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });

          // Upsert away team
          const fixtureAwayTeam = fixture.teams.away;
          const awayTeam = await prisma.team.upsert({
            where: { id: fixtureAwayTeam.id },
            update: {
              name: fixtureAwayTeam.name,
              logoUrl: fixtureAwayTeam.logo,
              updatedAt: new Date()
            },
            create: {
              id: fixtureAwayTeam.id,
              name: fixtureAwayTeam.name,
              logoUrl: fixtureAwayTeam.logo,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });

          // Upsert venue (handle null venue cases)
          const fixtureVenue = fixture.fixture.venue;
          let venue;
          
          if (fixtureVenue && fixtureVenue.id) {
            venue = await prisma.venue.upsert({
              where: { id: fixtureVenue.id },
              update: {
                name: fixtureVenue.name || 'Unknown Venue',
                updatedAt: new Date()
              },
              create: {
                id: fixtureVenue.id,
                name: fixtureVenue.name || 'Unknown Venue',
                createdAt: new Date(),
                updatedAt: new Date()
              }
            });
          } else {
            // Handle matches without venue information - skip venue or use null
            console.log(`Match ${fixture.fixture.id} has no venue information`);
            venue = null;
          }

          // Upsert competition
          const fixtureLeague = fixture.league;
          const competition = await prisma.competition.upsert({
            where: { id: fixtureLeague.id },
            update: {
              name: fixtureLeague.name,
              logoUrl: fixtureLeague.logo,
              updatedAt: new Date()
            },
            create: {
              id: fixtureLeague.id,
              name: fixtureLeague.name,
              logoUrl: fixtureLeague.logo,
              type: 'league', // Default type
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });

          // Upsert match using the actual database IDs from upserted entities
          const matchData: Match = apiFixtureToMatchData(fixture);
          const matchWithDetails = transformMatchWithDetails(
            matchData,
            homeTeam as Team,
            awayTeam as Team,
            competition as Competition,
            venue as Venue | null
          );

          matchesWithDetails.push(matchWithDetails);
          
          await prisma.match.upsert({
            where: {
              id: fixture.fixture.id
            },
            update: matchData,
            create: {
              ...matchData
            }
          });

        } catch (fixtureError) {
          console.error(`Failed to save fixture ${fixture.fixture.id}:`, fixtureError);
        }
      });

      await Promise.all(savePromises);
    } 
    catch (saveError) {
      console.error('Error saving fixtures to database:', saveError);
      // Continue execution - return the data even if save failed
    }

    return NextResponse.json({
      matches: matchesWithDetails,
      team: {
        id: team.id,
        name: team.name,
      }
    });

  } 
  catch (error) {
    console.error('Error fetching team matches:', error);
    
    if (error instanceof Error && error.message.includes('API request failed')) {
      return NextResponse.json(
        { error: 'Failed to fetch matches from API' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}