import { NextRequest, NextResponse } from 'next/server';
import { apiFootballService } from '@/lib/api-football';
import { supabaseClient } from '@/lib/supabase';
import { IdRouteParams } from '@/types/api/params';

export async function GET(
  request: NextRequest,
  { params }: IdRouteParams
) {
  try {
    const supabase = supabaseClient;
    const { id } = await params;
    const teamId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const saveToDb = searchParams.get('save') === 'true';
    const season = searchParams.get('season');
    const last = searchParams.get('last');
    const next = searchParams.get('next');
    
    if (isNaN(teamId)) {
      return NextResponse.json(
        { error: 'Invalid team ID' },
        { status: 400 }
      );
    }

    // First check if the team exists and get its API ID
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, api_id, name')
      .eq('id', teamId)
      .single();

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    if (!team.api_id) {
      return NextResponse.json(
        { error: 'Team does not have an API ID' },
        { status: 400 }
      );
    }

    // Fetch fixtures from Football API
    const fixtures = await apiFootballService.getTeamFixtures(
      team.api_id,
      season ? parseInt(season) : undefined,
      last ? parseInt(last) : undefined,
      next ? parseInt(next) : undefined
    );

    // Transform fixtures to our format
    const transformedMatches = fixtures.map(fixture => ({
      api_id: fixture.fixture.id,
      home_team: fixture.teams.home.name,
      home_team_logo: fixture.teams.home.logo,
      away_team: fixture.teams.away.name,
      away_team_logo: fixture.teams.away.logo,
      match_date: fixture.fixture.date,
      home_score: fixture.goals.home,
      away_score: fixture.goals.away,
      status: fixture.fixture.status.short,
      status_long: fixture.fixture.status.long,
      venue: fixture.fixture.venue.name,
      venue_city: fixture.fixture.venue.city,
      league: fixture.league.name,
      league_logo: fixture.league.logo,
      season: fixture.league.season,
      round: fixture.league.round
    }));

    // If requested, save matches to database
    if (saveToDb) {
      try {
        // For each fixture, check if teams and venues exist in our database
        const savePromises = fixtures.map(async (fixture) => {
          // Get home and away teams from our database
          const { data: homeTeam } = await supabase
            .from('teams')
            .select('id')
            .eq('api_id', fixture.teams.home.id)
            .single();

          const { data: awayTeam } = await supabase
            .from('teams')
            .select('id')
            .eq('api_id', fixture.teams.away.id)
            .single();

          // Get venue from our database
          const { data: venue } = await supabase
            .from('venues')
            .select('id')
            .eq('api_id', fixture.fixture.venue.id)
            .single();

          // Get competition from our database
          const { data: competition } = await supabase
            .from('competitions')
            .select('id')
            .eq('api_id', fixture.league.id)
            .single();

          // Only save if we have all required relationships
          if (homeTeam && awayTeam && venue && competition) {
            const matchData = {
              api_id: fixture.fixture.id,
              home_team_id: homeTeam.id,
              away_team_id: awayTeam.id,
              venue_id: venue.id,
              competition_id: competition.id,
              season_year: fixture.league.season,
              match_date: fixture.fixture.date,
              home_score: fixture.goals.home,
              away_score: fixture.goals.away,
              status_short: fixture.fixture.status.short,
              status_long: fixture.fixture.status.long,
              match_week: parseInt(fixture.league.round.replace(/\D/g, '')) || null,
              periods: fixture.score
            };

            // Insert or update match
            const { error: matchError } = await supabase
              .from('matches')
              .upsert(matchData, {
                onConflict: 'api_id',
                ignoreDuplicates: false
              });

            if (matchError) {
              console.error(`Failed to save match ${fixture.fixture.id}:`, matchError);
            }
          }
        });

        await Promise.all(savePromises);
      } catch (saveError) {
        console.error('Error saving matches to database:', saveError);
        // Continue execution - return the data even if save failed
      }
    }

    return NextResponse.json({
      matches: transformedMatches,
      team: {
        id: team.id,
        name: team.name,
        api_id: team.api_id
      },
      saved_to_db: saveToDb
    });

  } catch (error) {
    console.error('Error fetching team matches:', error);
    
    if (error instanceof Error && error.message.includes('API request failed')) {
      return NextResponse.json(
        { error: 'Failed to fetch matches from API' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}