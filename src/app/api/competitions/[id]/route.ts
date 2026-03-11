import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { IdRouteParams } from '@/types/api/params';

export async function GET(
  _request: NextRequest,
  { params }: IdRouteParams
) {
  try {
    const { id } = await params;
    const competitionId = parseInt(id);

    if (isNaN(competitionId)) {
      return NextResponse.json({ error: 'Invalid competition ID' }, { status: 400 });
    }

    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
      include: { country: true },
    });

    if (!competition) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    }

    return NextResponse.json(competition);
  } catch (error) {
    console.error('Error in competition detail API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
