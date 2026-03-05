import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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
    const teamId = parseInt(id);
    
    if (isNaN(teamId)) {
      return NextResponse.json(
        { error: 'Invalid team ID' },
        { status: 400 }
      );
    }

    // Fetch team with country and venue information
    const { data: team, error } = await supabase
      .from('teams')
      .select(`
        *,
        country: countries!inner (*),
        home_venue: venues!home_venue_id (*)
      `)
      .eq('id', teamId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Team not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch team details' },
        { status: 500 }
      );
    }

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(team);
  } 
  catch (error) {
    console.error('Error fetching team details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}