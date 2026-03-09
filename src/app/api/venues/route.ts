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

    // Search venues using Prisma with teams relation
    const venues = await prisma.venue.findMany({
      where: {
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { address: { contains: searchQuery, mode: 'insensitive' } },
          {
            teams: {
              some: {
                name: { contains: searchQuery, mode: 'insensitive' }
              }
            }
          }
        ]
      },
      include: {
        teams: {
          include: {
            country: true
          }
        }
      },
      orderBy: { name: 'asc' },
      take: 50
    });

    return NextResponse.json(venues);
  } 
  catch (error) {
    console.error('Error in venues API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}