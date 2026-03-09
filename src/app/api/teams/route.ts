import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    // Return empty array if no search query provided
    if (!query || query.trim().length < 2) {
      return NextResponse.json([]);
    }

    const searchQuery = query.toLowerCase();

    // Search teams using Prisma with relations
    const teams = await prisma.team.findMany({
      where: {
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { teamCode: { contains: searchQuery, mode: 'insensitive' } },
          { country: { name: { contains: searchQuery, mode: 'insensitive' } } }
        ]
      },
      include: {
        country: true,
        homeVenue: true
      },
      orderBy: { name: 'asc' },
      take: 50
    });

    return NextResponse.json(teams);
  } 
  catch (error) {
    console.error('Error in teams API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}