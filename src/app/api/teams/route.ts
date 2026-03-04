import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TeamWithCountry, VenueRow } from '@/types';

type TeamWithVenue = TeamWithCountry & {
  home_venue: VenueRow | null;
};

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch all teams with their countries and home venues
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        countries (*),
        venues!teams_home_venue_id_fkey (*)
      `)
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

    return NextResponse.json(teams);
  } 
  catch (error) {
    console.error('Error in teams API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}