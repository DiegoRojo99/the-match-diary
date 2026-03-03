import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TeamWithCountry, VenueRow } from '@/types';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch all venues
    const { data: venueData, error: venuesError } = await supabase
      .from('venues')
      .select(`*`)
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

    // Map venues with their team data
    const venues = venueData as VenueRow[];
    const venuesWithTeams = venues.map(venue => {
      const teamsForVenue = venueTeamsMap.get(venue.id) || [];      
      return {
        ...venue,
        teams: teamsForVenue,
      };
    });

    return NextResponse.json(venuesWithTeams);
  } 
  catch (error) {
    console.error('Error in venues API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}