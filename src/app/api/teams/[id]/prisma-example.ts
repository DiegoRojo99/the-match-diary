import { NextRequest, NextResponse } from 'next/server';
import { prisma, type TeamWithCountryAndVenue } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teamId = parseInt(params.id);
    
    if (isNaN(teamId)) {
      return NextResponse.json(
        { error: 'Invalid team ID' },
        { status: 400 }
      );
    }

    // ✨ Fully typed Prisma query with autocomplete and type safety
    const team: TeamWithCountryAndVenue | null = await prisma.team.findUnique({
      where: { 
        id: teamId 
      },
      include: {
        country: true,
        homeVenue: true,
      }
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // ✅ TypeScript knows the exact shape of this data
    const response = {
      id: team.id,
      name: team.name,
      teamCode: team.teamCode,
      foundedYear: team.foundedYear,
      national: team.national,
      logoUrl: team.logoUrl,
      apiId: team.apiId,
      country: team.country ? {
        id: team.country.id,
        name: team.country.name,
        code: team.country.code,
        flag: team.country.flag
      } : null,
      homeVenue: team.homeVenue ? {
        id: team.homeVenue.id,
        name: team.homeVenue.name,
        capacity: team.homeVenue.capacity,
        address: team.homeVenue.address,
        surface: team.homeVenue.surface,
        imageUrl: team.homeVenue.imageUrl
      } : null
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching team details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}