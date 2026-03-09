import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { IdRouteParams } from '@/types/api/params';

export async function GET(
  request: NextRequest,
  { params }: IdRouteParams
) {
  try {
    const { id } = await params;
    const venueId = parseInt(id);

    if (isNaN(venueId)) {
      return NextResponse.json({ error: 'Invalid venue ID' }, { status: 400 });
    }

    // Fetch venue with teams using Prisma
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      include: {
        teams: {
          include: {
            country: true
          }
        },
        city: {
          include: {
            country: true
          }
        }
      }
    });

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    return NextResponse.json(venue);
  } catch (error) {
    console.error('Error in venue API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}