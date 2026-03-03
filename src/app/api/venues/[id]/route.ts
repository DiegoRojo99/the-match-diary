import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { VenueRow } from '@/types/db/venues';
import { TeamRow } from '@/types/db/teams';
import { CountryRow } from '@/types';
import { IdRouteParams } from '@/types/api/params';

export async function GET(
  request: NextRequest,
  { params }: IdRouteParams
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { id } = await params;
    const venueId = id;

    // Fetch venue details
    const { data: venueData, error: venueError } = await supabase
      .from('venues')
      .select('*')
      .eq('id', venueId)
      .single();

    if (venueError || !venueData) {
      console.error('Error fetching venue:', venueError);
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    // Fetch teams that use this venue as their home with country details
    const { data: teamData, error: teamsError } = await supabase
      .from('teams')
      .select(`
        *,
        countries (*)
      `)
      .eq('home_venue_id', venueId);

    if (teamsError) console.error('Error fetching teams:', teamsError);
    
    // Created typed declared variables for better type inference
    const venue = venueData as VenueRow;
    const teams = teamData as (TeamRow & { countries: CountryRow })[] | null;

    // Return the complete venue data with all fields
    const result = {
      ...venue,
      teams: teams || [],
      country: teams && teams.length > 0 && teams[0].countries ? 
        teams[0].countries : null
    };

    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error in venue API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}