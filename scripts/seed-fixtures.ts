// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { apiFootballService } from '@/lib/api-football';
import { ApiFixture, ApiFixtureVenue } from '@/types/api/matches';

// Create Prisma client for seeding with PG adapter
const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  log: ['error', 'warn'],
  adapter
});

// Define target competitions and seasons
const TARGET_COMPETITIONS = [
  // Major 5 European Leagues
  { id: 39, name: "Premier League", country: "England" },
  { id: 140, name: "La Liga", country: "Spain" },
  { id: 135, name: "Serie A", country: "Italy" },
  { id: 78, name: "Bundesliga", country: "Germany" },
  { id: 61, name: "Ligue 1", country: "France" },
  // Top 3 European Competitions
  { id: 2, name: "UEFA Champions League", country: "International" },
  { id: 3, name: "UEFA Europa League", country: "International" },
  { id: 848, name: "UEFA Europa Conference League", country: "International" },
  // { id: 15, name: "FIFA Club World Cup", country: "International" }
];

const CURRENT_SEASON = 2025;
const LAST_SEASON = 2024;
const TARGET_SEASONS = [CURRENT_SEASON, LAST_SEASON];

// Function to normalize text for comparison (removes accents and converts to lowercase)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .trim();
}

// Function to extract meaningful words from venue names
function extractMeaningfulWords(text: string): string[] {
  const commonWords = ['stadium', 'stadyumu', 'stadi', 'estadio', 'estádio', 'arena', 'ground', 'park', 'campo', 'estadio', 'san', 'santa', 'de', 'la', 'el', 'del', 'new', 'old', 'nou', 'nuevo', 'nueva'];
  return normalizeText(text)
    .split(/[\s\-\.]+/)
    .filter(word => word.length > 2 && !commonWords.includes(word));
}

async function upsertTeam(apiTeam: { id: number; name: string; logo: string }, countryId?: number) {
  const existingTeam = await prisma.team.findUnique({
    where: { id: apiTeam.id }
  });

  if (existingTeam) {
    // Update team if missing data
    const needsUpdate = !existingTeam.logoUrl || !existingTeam.countryId;
    if (needsUpdate) {
      return await prisma.team.update({
        where: { id: apiTeam.id },
        data: {
          name: apiTeam.name,
          logoUrl: apiTeam.logo || existingTeam.logoUrl,
          countryId: countryId || existingTeam.countryId,
          updatedAt: new Date()
        }
      });
    }
    return existingTeam;
  }

  // Create new team
  return await prisma.team.create({
    data: {
      id: apiTeam.id,
      name: apiTeam.name,
      logoUrl: apiTeam.logo,
      countryId: countryId,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
}

async function upsertVenue(apiVenue: ApiFixtureVenue) {
  let venue;
  console.log(`Processing venue: "${apiVenue.name}" in "${apiVenue.city}" (ID: ${apiVenue.id})`);
  
  // If we have an API ID, try to find by ID first
  if (apiVenue.id) {
    venue = await prisma.venue.findUnique({
      where: { id: apiVenue.id }
    });
    
    if (venue) {
      // Update venue if missing city data
      const needsUpdate = !venue.city && apiVenue.city;
      if (needsUpdate) {
        return await prisma.venue.update({
          where: { id: venue.id },
          data: {
            city: apiVenue.city,
            updatedAt: new Date()
          }
        });
      }
      return venue;
    }
  }
  
  // If no API ID or venue not found by ID, try exact name match (accent-insensitive)
  if (apiVenue.name) {
    const normalizedApiName = normalizeText(apiVenue.name);
    
    // First try exact normalized match
    const venues = await prisma.venue.findMany({
      where: { 
        name: {
          mode: 'insensitive'
        }
      }
    });
    
    venue = venues.find(v => normalizeText(v.name) === normalizedApiName);
    
    if (!venue) {
      // Fallback to database case-insensitive match
      venue = await prisma.venue.findFirst({
        where: { 
          name: {
            equals: apiVenue.name,
            mode: 'insensitive'
          }
        }
      });
    }
    
    if (venue) {
      console.log(`✅ Found venue by normalized name: "${venue.name}" = "${apiVenue.name}"`);
      
      // If found by name but we have a different API ID, update the venue's ID
      if (apiVenue.id && venue.id !== apiVenue.id) {
        console.log(`🔄 Updating venue API ID: ${venue.name} (${venue.id} -> ${apiVenue.id})`);
        return await prisma.venue.update({
          where: { id: venue.id },
          data: {
            id: apiVenue.id,
            city: apiVenue.city || venue.city,
            updatedAt: new Date()
          }
        });
      }
      
      // Update city if missing
      const needsUpdate = !venue.city && apiVenue.city;
      if (needsUpdate) {
        return await prisma.venue.update({
          where: { id: venue.id },
          data: {
            city: apiVenue.city,
            updatedAt: new Date()
          }
        });
      }
      return venue;
    }
  }
  
  // If still not found and we have a city, try fuzzy matching in that city
  if (apiVenue.city && apiVenue.name) {
    console.log(`🔍 Searching for similar venues in ${apiVenue.city}...`);
    
    // Get all venues in the same city (accent-insensitive)
    const cityVenues = await prisma.venue.findMany({
      where: { 
        city: {
          equals: apiVenue.city,
          mode: 'insensitive'
        }
      }
    });
    
    if (cityVenues.length > 0) {
      const apiVenueName = normalizeText(apiVenue.name);
      const apiWords = extractMeaningfulWords(apiVenue.name);
      
      // Strategy 1: Check for exact normalized match
      for (const existingVenue of cityVenues) {
        const existingNameNormalized = normalizeText(existingVenue.name);
        
        if (apiVenueName === existingNameNormalized) {
          console.log(`🎯 Found exact normalized match: "${existingVenue.name}" = "${apiVenue.name}" in ${apiVenue.city}`);
          
          // Update the existing venue with new API ID if provided
          if (apiVenue.id && existingVenue.id !== apiVenue.id) {
            return await prisma.venue.update({
              where: { id: existingVenue.id },
              data: {
                id: apiVenue.id,
                name: apiVenue.name, // Update to API name as it might be more current
                updatedAt: new Date()
              }
            });
          }
          
          return existingVenue;
        }
      }
      
      // Strategy 2: Check for significant word overlap (accent-insensitive)
      for (const existingVenue of cityVenues) {
        const existingWords = extractMeaningfulWords(existingVenue.name);
        
        // Check for significant word overlap
        const matchingWords = apiWords.filter(apiWord => 
          existingWords.some(existingWord => 
            existingWord.includes(apiWord) || apiWord.includes(existingWord)
          )
        );
        
        // If we have significant overlap (at least 50% of meaningful words)
        if (matchingWords.length >= Math.max(1, Math.min(apiWords.length, existingWords.length) * 0.5)) {
          console.log(`🎯 Found similar venue: "${existingVenue.name}" matches "${apiVenue.name}" in ${apiVenue.city} (matching words: ${matchingWords.join(', ')})`);
          
          // Update the existing venue with new API ID if provided
          if (apiVenue.id && existingVenue.id !== apiVenue.id) {
            return await prisma.venue.update({
              where: { id: existingVenue.id },
              data: {
                id: apiVenue.id,
                name: apiVenue.name, // Update to API name as it might be more current
                updatedAt: new Date()
              }
            });
          }
          
          // Update name to API name if it seems more current/complete
          const needsUpdate = apiVenue.name.length > existingVenue.name.length;
          if (needsUpdate) {
            return await prisma.venue.update({
              where: { id: existingVenue.id },
              data: {
                name: apiVenue.name,
                updatedAt: new Date()
              }
            });
          }
          
          return existingVenue;
        }
      }
      
      // Strategy 3: Check if normalized venue name is contained in API name or vice versa
      for (const existingVenue of cityVenues) {
        const existingNameNormalized = normalizeText(existingVenue.name);
        
        if (apiVenueName.includes(existingNameNormalized) || existingNameNormalized.includes(apiVenueName)) {
          console.log(`🎯 Found contained venue name: "${existingVenue.name}" <-> "${apiVenue.name}" in ${apiVenue.city}`);
          
          // Update with API data
          if (apiVenue.id && existingVenue.id !== apiVenue.id) {
            return await prisma.venue.update({
              where: { id: existingVenue.id },
              data: {
                id: apiVenue.id,
                name: apiVenue.name,
                updatedAt: new Date()
              }
            });
          }
          
          return existingVenue;
        }
      }
    }
  }
  
  // If no match found and we have an API ID, create new venue
  if (apiVenue.id) {
    console.log(`➕ Creating new venue: ${apiVenue.name} (${apiVenue.city}) with ID ${apiVenue.id}`);
    return await prisma.venue.create({
      data: {
        id: apiVenue.id,
        name: apiVenue.name,
        city: apiVenue.city,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }
  
  // If no API ID, skip venue creation as our schema requires it
  console.log(`⚠️ Skipping venue without API ID: ${apiVenue.name} (${apiVenue.city})`);
  return null;
}

async function upsertMatch(apiFixture: ApiFixture, competitionId: number, season: number) {
  const existingMatch = await prisma.match.findUnique({
    where: { id: apiFixture.fixture.id }
  });

  // Upsert teams
  const homeTeam = await upsertTeam(apiFixture.teams.home);
  const awayTeam = await upsertTeam(apiFixture.teams.away);

  // Upsert venue if provided
  let venue = null;
  const apiVenue = apiFixture.fixture.venue;
  console.log(`Processing fixture ${apiFixture.fixture.id}: ${homeTeam.name} vs ${awayTeam.name} at ${apiVenue ? apiVenue.name : 'Unknown Venue'}`);
  if (apiVenue) {
    venue = await upsertVenue(apiVenue);
  }

  const matchData = {
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    venueId: venue?.id,
    competitionId: competitionId,
    seasonYear: season,
    matchDate: new Date(apiFixture.fixture.date),
    homeScore: apiFixture.goals.home,
    awayScore: apiFixture.goals.away,
    statusShort: apiFixture.fixture.status.short,
    statusLong: apiFixture.fixture.status.long,
    matchWeek: null, // Would need to parse from round
    updatedAt: new Date()
  };

  if (existingMatch) {
    return await prisma.match.update({
      where: { id: apiFixture.fixture.id },
      data: matchData
    });
  }

  return await prisma.match.create({
    data: {
      id: apiFixture.fixture.id,
      ...matchData,
      createdAt: new Date()
    }
  });
}

async function seedFixtures() {
  console.log('⚽ Starting fixtures seeding...');
  console.log(`🎯 Target competitions: ${TARGET_COMPETITIONS.length}`);
  console.log(`📅 Target seasons: ${TARGET_SEASONS.join(', ')}`);
  
  try {
    let totalCompetitionsProcessed = 0;
    let totalSeasonsProcessed = 0;
    let totalNewMatches = 0;
    let totalUpdatedMatches = 0;
    let totalSkippedMatches = 0;

    for (const competition of TARGET_COMPETITIONS) {
      totalCompetitionsProcessed++;
      const compProgress = `[${totalCompetitionsProcessed}/${TARGET_COMPETITIONS.length}]`;
      
      console.log(`\n${compProgress} 🏆 ${competition.name} (${competition.country})`);

      // Verify competition exists in database
      const dbCompetition = await prisma.competition.findUnique({
        where: { id: competition.id }
      });

      if (!dbCompetition) {
        console.log(`⚠️ Competition not found in database: ${competition.name} (ID: ${competition.id})`);
        console.log(`   Skipping this competition. Make sure to seed competitions first.`);
        continue;
      }

      for (const season of TARGET_SEASONS) {
        totalSeasonsProcessed++;
        const seasonProgress = `[Season ${season}]`;
        
        console.log(`  ${seasonProgress} Fetching fixtures...`);

        try {
          // Fetch fixtures from API
          const apiFixtures: ApiFixture[] = await apiFootballService.getFixtures(
            competition.id,
            season
          );

          console.log(`  📥 Received ${apiFixtures.length} fixtures from API`);

          if (apiFixtures.length === 0) {
            console.log(`  ⚠️ No fixtures returned for ${season} season`);
            continue;
          }

          // Process each fixture
          for (let i = 0; i < apiFixtures.length; i++) {
            const fixture = apiFixtures[i];
            
            try {
              const existingMatch = await prisma.match.findUnique({
                where: { id: fixture.fixture.id }
              });

              if (existingMatch) {
                // Check if we need to update (e.g., score changed)
                const needsUpdate = existingMatch.homeScore !== fixture.goals.home ||
                                  existingMatch.awayScore !== fixture.goals.away ||
                                  existingMatch.statusShort !== fixture.fixture.status.short;

                if (needsUpdate) {
                  await upsertMatch(fixture, competition.id, season);
                  totalUpdatedMatches++;
                  if ((totalUpdatedMatches + totalNewMatches) % 50 === 0) {
                    console.log(`    📊 Progress: ${totalUpdatedMatches + totalNewMatches} matches processed`);
                  }
                } else {
                  totalSkippedMatches++;
                }
              } else {
                await upsertMatch(fixture, competition.id, season);
                totalNewMatches++;
                if ((totalUpdatedMatches + totalNewMatches) % 50 === 0) {
                  console.log(`    📊 Progress: ${totalUpdatedMatches + totalNewMatches} matches processed`);
                }
              }
            } catch (matchError) {
              console.error(`    ❌ Error processing match ${fixture.fixture.id}:`, matchError);
            }
          }

          console.log(`  ✅ ${seasonProgress} Complete: ${apiFixtures.length} fixtures processed`);

          // Add delay between seasons to respect API rate limits
          if (TARGET_SEASONS.indexOf(season) < TARGET_SEASONS.length - 1) {
            console.log('    ⏳ Waiting 3 seconds before next season...');
            await new Promise(resolve => setTimeout(resolve, 3000));
          }

        } catch (seasonError) {
          console.error(`  ❌ Error fetching fixtures for ${season}:`, seasonError);
          continue;
        }
      }

      // Add delay between competitions to respect API rate limits
      if (totalCompetitionsProcessed < TARGET_COMPETITIONS.length) {
        console.log('  ⏳ Waiting 5 seconds before next competition...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // Final summary
    console.log('\n🎉 Fixture seeding completed!');
    console.log(`📊 Summary:`);
    console.log(`   Competitions processed: ${totalCompetitionsProcessed}`);
    console.log(`   Seasons processed: ${totalSeasonsProcessed}`);
    console.log(`   New matches added: ${totalNewMatches}`);
    console.log(`   Matches updated: ${totalUpdatedMatches}`);
    console.log(`   Matches skipped (up to date): ${totalSkippedMatches}`);
    console.log(`   Total matches processed: ${totalNewMatches + totalUpdatedMatches + totalSkippedMatches}`);

    if (totalNewMatches > 0 || totalUpdatedMatches > 0) {
      console.log('\n✨ Match data has been refreshed successfully!');
      console.log('💡 Next steps:');
      console.log('   - Run venue seeding if you noticed missing venues');
      console.log('   - Verify team associations with venues');
      console.log('   - Check for any missing team logos or country associations');
    }

  } catch (error) {
    console.error('❌ Fixture seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

// Run the seeding
if (require.main === module) {
  seedFixtures()
    .then(() => {
      console.log('✅ Fixture seeding script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fixture seeding script failed:', error);
      process.exit(1);
    });
}

export { seedFixtures };
