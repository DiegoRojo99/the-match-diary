import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TeamWithCountry, VenueRow } from '@/types';

type TeamWithVenue = TeamWithCountry & {
  home_venue: VenueRow | null;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    // Return empty array if no search query provided
    if (!query || query.trim().length < 2) {
      return NextResponse.json([]);
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Search teams by name, code  
    const searchQuery = query.toLowerCase();
    
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        country: countries (*),
        venues!teams_home_venue_id_fkey (*)
      `)
      .or(`name.ilike.%${searchQuery}%,team_code.ilike.%${searchQuery}%`)
      .limit(200)
      .order('name');

    if (error) {
      console.error('Error fetching teams:', error);
      return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
    }

    // Transform the data to include home venue information
    const teams: TeamWithVenue[] = data.map(team => ({
      ...team,
      home_venue: team.venues || null
    }));

    // Additional client-side filtering for country names and limit to 50 results
    const filteredTeams = teams.filter(team => {
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