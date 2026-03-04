import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TeamWithCountry, VenueRow } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    // Return empty array if no search query provided
    if (!query || query.trim().length < 2) {
      return NextResponse.json([]);
    }

    const searchQuery = query.toLowerCase();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Search venues by name, address
    const { data: venueData, error: venuesError } = await supabase
      .from('venues')
      .select(`*`)
      .or(`name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`)
      .limit(200)
      .order('name');

    if (venuesError) {
      console.error('Error fetching venues:', venuesError);
      return NextResponse.json({ error: 'Failed to fetch venues' }, { status: 500 });
    }

    // Fetch all teams with their home venues and countries
    const { data, error: teamsError } = await supabase
      .from('teams')
      .select(`
        *,
        countries (*)
      `)
      .not('home_venue_id', 'is', null);

    if (teamsError) {
      console.error('Error fetching teams:', teamsError);
      return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
    }

    // Create a map of venue ID to teams
    const teams: TeamWithCountry[] = data as TeamWithCountry[];
    const venueTeamsMap = new Map<number, TeamWithCountry[]>();
    teams.forEach((team: TeamWithCountry) => {
      const teamVenueId = team.home_venue_id;
      if (!teamVenueId) return;
      if (!venueTeamsMap.has(teamVenueId)) venueTeamsMap.set(teamVenueId, []);
      const venueMap = venueTeamsMap.get(teamVenueId);
      if (!venueMap) return;
      venueMap.push(team);
    });

    // Map venues with their team data and apply additional filtering
    const venues = venueData as VenueRow[];
    const venuesWithTeams = venues.map(venue => {
      const teamsForVenue = venueTeamsMap.get(venue.id) || [];      
      return {
        ...venue,
        teams: teamsForVenue,
      };
    });

    // Additional client-side filtering for team names and limit to 50 results
    const filteredVenues = venuesWithTeams.filter(venue => {
      const venueNameMatch = venue.name.toLowerCase().includes(searchQuery);
      const addressMatch = venue.address?.toLowerCase().includes(searchQuery);
      const teamMatch = venue.teams.some(team => 
        team.name.toLowerCase().includes(searchQuery)
      );
      
      return venueNameMatch || addressMatch || teamMatch;
    }).slice(0, 50); // Limit to 50 results

    return NextResponse.json(filteredVenues);
  } 
  catch (error) {
    console.error('Error in venues API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}