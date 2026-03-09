import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { IdRouteParams } from '@/types/api/params';

export async function GET(
  request: NextRequest,
  { params }: IdRouteParams
) {
  try {
    const { id } = await params;
    const teamId = parseInt(id);
    
    if (isNaN(teamId)) {
      return NextResponse.json(
        { error: 'Invalid team ID' },
        { status: 400 }
      );
    }

    // Fetch team with country and venue information using Prisma
    const team = await prisma.team.findUnique({
      where: {
        id: teamId
      },
      include: {
        country: true,
        homeVenue: true
      }
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Transform data to match expected format (snake_case for compatibility)
    const transformedTeam = {
      id: team.id,
      name: team.name,
      team_code: team.teamCode,
      country_id: team.countryId,
      founded_year: team.foundedYear,
      national: team.national,
      logo_url: team.logoUrl,
      home_venue_id: team.homeVenueId,
      created_at: team.createdAt,
      updated_at: team.updatedAt,
      country: team.country,
      home_venue: team.homeVenue
    };

    return NextResponse.json(transformedTeam);
  } 
  catch (error) {
    console.error('Error fetching team details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}