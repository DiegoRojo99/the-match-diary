import { NextRequest, NextResponse } from 'next/server';
import { prisma, TeamWithVenue } from '@/lib/prisma';
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
      where: { id: teamId },
      include: {
        country: true,
        homeVenue: true
      }
    }) as TeamWithVenue | null;

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(team);
  } 
  catch (error) {
    console.error('Error fetching team details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}