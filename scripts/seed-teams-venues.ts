// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { apiFootballService } from '@/lib/api-football';
import type { TeamTable, VenueTable } from '@/types/db';

// Create Supabase client for seeding
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin operations
);

interface ApiTeam {
  team: {
    id: number;
    name: string;
    code?: string;
    country: string;
    founded?: number;
    national: boolean;
    logo: string;
  };
  venue: {
    id: number;
    name: string;
    address?: string;
    city: string;
    capacity?: number;
    surface?: string;
    image?: string;
  };
}

async function seedTeamsAndVenues() {
  console.log('🏈 Starting teams and venues seeding...');
  
  try {
    // 1. Get all visible competitions that haven't been seeded yet, sorted by country_id (nulls last) 
    console.log('🔍 Fetching visible competitions that need seeding...');
    const { data: competitions, error: compError } = await supabase
      .from('competitions')
      .select(`
        id,
        api_id,
        name,
        country_id,
        seeded,
        countries (
          id,
          name,
          code
        )
      `)
      .eq('visible', true)
      .eq('seeded', false)
      .order('country_id', { ascending: true, nullsLast: true });
    
    if (compError) {
      throw new Error(`Error fetching competitions: ${compError.message}`);
    }
    
    if (!competitions || competitions.length === 0) {
      console.log('❌ No visible competitions found that need seeding');
      console.log('ℹ️  All visible competitions may already be seeded');
      return;
    }
    
    console.log(`✅ Found ${competitions.length} visible competitions that need seeding`);
    console.log('📋 Competition priority order:');
    competitions.slice(0, 10).forEach((comp, idx) => {
      const countryInfo = comp.countries ? `${comp.countries.name} (${comp.countries.code})` : 'International/Continental';
      console.log(`  ${idx + 1}. ${comp.name} - ${countryInfo} (API ID: ${comp.api_id})`);
    });
    if (competitions.length > 10) {
      console.log(`  ... and ${competitions.length - 10} more`);
    }
    
    // 2. Process all competitions (sorted by priority)
    let totalNewTeams = 0;
    let totalUpdatedTeams = 0;
    let totalNewVenues = 0;
    let totalSkippedTeams = 0;
    let totalSkippedVenues = 0;
    let totalTeamsProcessed = 0;
    
    console.log(`\n🎯 Processing teams from ${competitions.length} visible competitions...`);
    
    for (let i = 0; i < competitions.length; i++) {
      const targetCompetition = competitions[i];
      const progress = `[${i + 1}/${competitions.length}]`;
      
      console.log(`\n${progress} 🏆 ${targetCompetition.name}`);
      console.log(`   Country: ${targetCompetition.countries?.name || 'International/Continental'}`);
      console.log(`   API ID: ${targetCompetition.api_id}`);
      
      // 3. Check existing teams and venues to avoid duplicates (refresh each time)
      console.log('🔍 Checking existing teams and venues...');
      const { data: existingTeams, error: teamsError } = await supabase
        .from('teams')
        .select('api_id, name, country_id');
      
      if (teamsError) {
        console.error(`❌ Error fetching existing teams: ${teamsError.message}`);
        continue; // Skip this competition but continue with others
      }
      
      const { data: existingVenues, error: venuesError } = await supabase
        .from('venues')
        .select('api_id, name');
      
      if (venuesError) {
        console.error(`❌ Error fetching existing venues: ${venuesError.message}`);
        continue;
      }
      
      const existingTeamIds = new Set(existingTeams?.map(t => t.api_id) || []);
      const existingVenueIds = new Set(existingVenues?.map(v => v.api_id) || []);
      const teamsWithoutCountry = new Map((existingTeams || [])
        .filter(t => !t.country_id)
        .map(t => [t.api_id, t]));
      
      console.log(`📊 ${existingTeamIds.size} teams, ${existingVenueIds.size} venues, ${teamsWithoutCountry.size} teams without country`);
      
      // 4. Fetch teams from API for the current competition
      console.log(`📡 Fetching teams for ${targetCompetition.name}...`);
      let apiTeams: ApiTeam[];
      
      try {
        apiTeams = await apiFootballService.getTeams(targetCompetition.api_id, 2024);
      } catch (error) {
        console.error(`❌ API error for ${targetCompetition.name}:`, error);
        continue; // Skip this competition but continue with others
      }
      
      console.log(`✅ Retrieved ${apiTeams.length} teams from API`);
      
      if (apiTeams.length === 0) {
        console.log('⚠️  No teams found for this competition, skipping...');
        continue;
      }
      
      // 5. Show sample teams for first few competitions only
      if (i < 3) {
        console.log('🔍 Sample teams:');
        apiTeams.slice(0, 3).forEach(teamData => {
          console.log(`  - ${teamData.team.name} (${teamData.team.country}) - Venue: ${teamData.venue.name}`);
        });
        if (apiTeams.length > 3) {
          console.log(`  ... and ${apiTeams.length - 3} more`);
        }
      }
      
      // 6. Process teams and venues for this competition
      let newTeams = 0;
      let updatedTeams = 0;
      let newVenues = 0;
      let skippedTeams = 0;
      let skippedVenues = 0;
      
      console.log(`💾 Processing ${apiTeams.length} teams and their venues...`);
      
      for (const teamData of apiTeams) {
        const team = teamData.team;
        const venue = teamData.venue;
        
        // Process venue first (teams reference venues)
        let venueId: number | null = null;
        
        if (venue && venue.id) {
          if (existingVenueIds.has(venue.id)) {
            // Venue already exists, get its database ID
            const { data: existingVenue } = await supabase
              .from('venues')
              .select('id')
              .eq('api_id', venue.id)
              .single();
            
            venueId = existingVenue?.id || null;
            skippedVenues++;
          } else {
            // Insert new venue
            const venueData: VenueTable['Insert'] = {
              api_id: venue.id,
              name: venue.name,
              address: venue.address || null,
              city_id: null, // TODO: Map city name to city_id when cities table exists
              capacity: venue.capacity || null,
              surface: venue.surface || null,
              image_url: venue.image || null
            };
            
            const { data: insertedVenue, error: venueInsertError } = await supabase
              .from('venues')
              .insert(venueData)
              .select('id')
              .single();
            
            if (venueInsertError) {
              console.error(`❌ Error inserting venue ${venue.name}:`, venueInsertError);
              venueId = null;
            } else {
              venueId = insertedVenue.id;
              newVenues++;
            }
          }
        }
        
        // Process team
        if (existingTeamIds.has(team.id)) {
          // Team exists - check if we need to update country_id
          const existingTeamWithoutCountry = teamsWithoutCountry.get(team.id);
          
          if (existingTeamWithoutCountry && targetCompetition.country_id) {
            // Update team with country information
            const { error: updateError } = await supabase
              .from('teams')
              .update({ country_id: targetCompetition.country_id })
              .eq('api_id', team.id);
            
            if (updateError) {
              console.error(`❌ Error updating team ${team.name} country:`, updateError);
            } else {
              console.log(`🌍 Updated ${team.name} with country: ${targetCompetition.countries?.name}`);
              updatedTeams++;
            }
          } else {
            skippedTeams++;
          }
        } else {
          // Insert new team
          const teamData: TeamTable['Insert'] = {
            api_id: team.id,
            name: team.name,
            team_code: team.code || null,
            country_id: targetCompetition.country_id || null,
            founded_year: team.founded || null,
            national: team.national,
            logo_url: team.logo,
            home_venue_id: venueId
          };
          
          const { error: teamInsertError } = await supabase
            .from('teams')
            .insert(teamData);
          
          if (teamInsertError) {
            console.error(`❌ Error inserting team ${team.name}:`, teamInsertError);
          } else {
            newTeams++;
          }
        }
      }
      
      // Log competition summary
      console.log(`${progress} ✅ Teams: +${newTeams} new, +${updatedTeams} updated, ${skippedTeams} skipped`);
      console.log(`${progress} ✅ Venues: +${newVenues} new, ${skippedVenues} skipped`);
      
      // Mark competition as seeded
      const { error: seededError } = await supabase
        .from('competitions')
        .update({ seeded: true })
        .eq('id', targetCompetition.id);
      
      if (seededError) {
        console.error(`${progress} ❌ Error marking competition as seeded:`, seededError);
      } else {
        console.log(`${progress} ✅ Marked competition as seeded`);
      }
      
      // Add to totals
      totalNewTeams += newTeams;
      totalUpdatedTeams += updatedTeams;
      totalNewVenues += newVenues;
      totalSkippedTeams += skippedTeams;
      totalSkippedVenues += skippedVenues;
      totalTeamsProcessed += apiTeams.length;
    }
    
    // 7. Overall Summary
    console.log(`\n🎉 Teams and Venues Seeding Summary:`);
    console.log(`   Competitions Processed: ${competitions.length}`);
    console.log(`   📈 New teams inserted: ${totalNewTeams}`);
    console.log(`   🌍 Teams updated with country: ${totalUpdatedTeams}`);
    console.log(`   ⏭️  Teams skipped (already exist): ${totalSkippedTeams}`);
    console.log(`   🏟️  New venues inserted: ${totalNewVenues}`);
    console.log(`   ⏭️  Venues skipped (already exist): ${totalSkippedVenues}`);
    console.log(`   📊 Total teams processed: ${totalTeamsProcessed}`);
    
    // Show final database stats
    const { data: totalTeams } = await supabase
      .from('teams')
      .select('id', { count: 'exact' });
    
    const { data: totalVenues } = await supabase
      .from('venues')
      .select('id', { count: 'exact' });
    
    console.log(`\n📊 Final Database Status:`);
    console.log(`   Total teams in database: ${totalTeams?.length || 0}`);
    console.log(`   Total venues in database: ${totalVenues?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Error in teams and venues seeding:', error);
    throw error;
  }
}

// Main execution
async function main() {
  console.log('🚀 Teams and Venues Seeding Started');
  console.log('='.repeat(50));
  
  try {
    await seedTeamsAndVenues();
    
    console.log('='.repeat(50));
    console.log('✅ Teams and Venues seeding completed successfully!');
    
  } catch (error) {
    console.error('💥 Teams and Venues seeding failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { seedTeamsAndVenues };