// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { apiFootballService } from '@/lib/api-football';
import { ApiTeam, ApiTeamResponse } from '@/types/api/teams';

// Create Prisma client for seeding with PG adapter
const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  log: ['error', 'warn'],
  adapter
});

async function seedTeamsAndVenues() {
  console.log('🏈 Starting teams and venues seeding...');
  
  try {
    // 1. Get all visible competitions that haven't been seeded yet, sorted by countryId (nulls last) 
    console.log('🔍 Fetching visible competitions that need seeding...');
    const competitions = await prisma.competition.findMany({
      where: {
        visible: true,
        seeded: false
      },
      include: {
        country: true
      },
      orderBy: {
        countryId: 'asc'
      }
    });
    
    if (!competitions || competitions.length === 0) {
      console.log('❌ No visible competitions found that need seeding');
      console.log('ℹ️  All visible competitions may already be seeded');
      return;
    }
    
    console.log(`✅ Found ${competitions.length} visible competitions that need seeding`);
    console.log('📋 Competition priority order:');
    competitions.slice(0, 10).forEach((comp, idx) => {
      const countryInfo = comp.country ? `${comp.country.name} (${comp.country.code})` : 'International/Continental';
      console.log(`  ${idx + 1}. ${comp.name} - ${countryInfo} (ID: ${comp.id})`);
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
      console.log(`   Country: ${targetCompetition.country?.name || 'International/Continental'}`);
      console.log(`   ID: ${targetCompetition.id}`);
      
      // 3. Check existing teams and venues to avoid duplicates (refresh each time)
      console.log('🔍 Checking existing teams and venues...');
      const existingTeams = await prisma.team.findMany({
        select: {
          id: true,
          name: true,
          countryId: true
        }
      });
      
      const existingVenues = await prisma.venue.findMany({
        select: {
          id: true,
          name: true
        }
      });
      
      const existingTeamIds = new Set(existingTeams.map(t => t.id));
      const existingVenueIds = new Set(existingVenues.map(v => v.id));
      const teamsWithoutCountry = new Map(existingTeams
        .filter(t => !t.countryId)
        .map(t => [t.id, t]));
      
      console.log(`📊 ${existingTeamIds.size} teams, ${existingVenueIds.size} venues, ${teamsWithoutCountry.size} teams without country`);
      
      // 4. Fetch teams from API for the current competition
      console.log(`📡 Fetching teams for ${targetCompetition.name}...`);
      let apiTeams: ApiTeamResponse[];
      
      try {
        const competitionId = targetCompetition.id;
        
        const apiResponse = await apiFootballService.getTeams(competitionId, 2025);
        apiTeams = apiResponse as ApiTeamResponse[];
        console.log(`📊 API returned ${apiTeams.length} teams`);
      } 
      catch (error) {
        console.error(`❌ API error for ${targetCompetition.name}:`, error);
        continue; // Skip this competition but continue with others
      }
      
      console.log(`✅ Retrieved ${apiTeams.length} teams from API`);
      
      if (apiTeams.length === 0) {
        console.log('⚠️  No teams found for this competition, skipping...');
        continue;
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
        
        if (venue && venue.id && venue.id > 0) {
          if (existingVenueIds.has(venue.id)) {
            // Venue already exists, use its ID
            venueId = venue.id;
            skippedVenues++;
          } 
          else {
            // Insert new venue
            try {
              const venueData = {
                id: venue.id,
                name: venue.name,
                address: venue.address || null,
                cityId: null, // TODO: Map city name to cityId when cities table exists
                capacity: venue.capacity || null,
                surface: venue.surface || null,
                imageUrl: venue.image || null
              };
              
              console.log(`🏟️  Inserting venue: ${venue.name} (ID: ${venue.id})`);
              
              const insertedVenue = await prisma.venue.create({
                data: venueData,
                select: {
                  id: true
                }
              });
              
              venueId = insertedVenue.id;
              existingVenueIds.add(venueId); // Add to the set to prevent future duplicates
              newVenues++;
            } catch (venueInsertError) {
              console.error(`❌ Error inserting venue ${venue.name} (ID: ${venue.id}):`, venueInsertError);
              venueId = null;
            }
          }
        } else {
          if (venue) {
            console.log(`⚠️  Skipping venue with invalid ID: ${venue.name} (ID: ${venue.id})`);
          }
        }
        
        // Process team
        if (existingTeamIds.has(team.id)) {
          // Team exists - check if we need to update countryId
          const existingTeamWithoutCountry = teamsWithoutCountry.get(team.id);
          
          if (existingTeamWithoutCountry && targetCompetition.countryId) {
            // Update team with country information
            try {
              await prisma.team.update({
                where: { id: team.id },
                data: { countryId: targetCompetition.countryId }
              });
              
              console.log(`🌍 Updated ${team.name} with country: ${targetCompetition.country?.name}`);
              updatedTeams++;
            } catch (updateError) {
              console.error(`❌ Error updating team ${team.name} country:`, updateError);
            }
          } 
          else {
            skippedTeams++;
          }
        } 
        else {
          // Insert new team
          try {
            const teamData = {
              id: team.id,
              name: team.name,
              teamCode: team.code || null,
              countryId: targetCompetition.countryId || null,
              foundedYear: team.founded || null,
              national: team.national,
              logoUrl: team.logo,
              homeVenueId: venueId
            };
            
            await prisma.team.create({
              data: teamData
            });
            
            newTeams++;
          } catch (teamInsertError) {
            console.error(`❌ Error inserting team ${team.name}:`, teamInsertError);
          }
        }
      }
      
      // Log competition summary
      console.log(`${progress} ✅ Teams: +${newTeams} new, +${updatedTeams} updated, ${skippedTeams} skipped`);
      console.log(`${progress} ✅ Venues: +${newVenues} new, ${skippedVenues} skipped`);
      
      // Mark competition as seeded
      try {
        await prisma.competition.update({
          where: { id: targetCompetition.id },
          data: { seeded: true }
        });
        
        console.log(`${progress} ✅ Marked competition as seeded`);
      } catch (seededError) {
        console.error(`${progress} ❌ Error marking competition as seeded:`, seededError);
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
    const totalTeams = await prisma.team.count();
    const totalVenues = await prisma.venue.count();
    
    console.log(`\n📊 Final Database Status:`);
    console.log(`   Total teams in database: ${totalTeams}`);
    console.log(`   Total venues in database: ${totalVenues}`);
    
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
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { seedTeamsAndVenues };