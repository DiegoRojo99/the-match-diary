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

    // Search teams by name or team code using Prisma
    const searchQuery = query.toLowerCase();
    
    const teams = await prisma.team.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchQuery,
              mode: 'insensitive'
            }
          },
          {
            teamCode: {
              contains: searchQuery,
              mode: 'insensitive'
            }
          }
        ]
      },
      include: {
        country: true,
        homeVenue: true
      },
      orderBy: {
        name: 'asc'
      },
      take: 200
    });

    // Transform the data to match expected format (snake_case for compatibility)
    const transformedTeams = teams.map(team => ({
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
    }));

    // Additional client-side filtering for country names and limit to 50 results
    const filteredTeams = transformedTeams.filter(team => {
      const teamNameMatch = team.name.toLowerCase().includes(searchQuery);
      const codeMatch = team.team_code?.toLowerCase().includes(searchQuery);
      const countryMatch = team.country?.name.toLowerCase().includes(searchQuery);
      
      return teamNameMatch || codeMatch || countryMatch;
    }).slice(0, 50); // Limit to 50 results

    return NextResponse.json(filteredTeams);
  } 
  catch (error) {
    console.error('Error in teams API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}