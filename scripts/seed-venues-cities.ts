// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { apiFootballService } from '@/lib/api-football';
import { ApiVenue } from '@/types/api/venues';

// Create Prisma client for seeding with PG adapter
const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  log: ['error', 'warn'],
  adapter
});

async function seedVenues() {
  console.log('🏟️ Starting venues seeding...');
  
  try {
    // 1. Get all countries to fetch venues from
    console.log('🔍 Fetching countries with football activity...');
    const countries = await prisma.country.findMany({
      where: {
        OR: [
          // Countries that have competitions
          { competitions: { some: { visible: true } } },
          // Countries that have teams
          { teams: { some: {} } }
        ]
      },
      orderBy: {
        name: 'asc'
      }
    });

    if (!countries || countries.length === 0) {
      console.log('❌ No countries found with football activity');
      return;
    }

    console.log(`✅ Found ${countries.length} countries with football activity`);

    // 2. Get existing venues to avoid duplicates
    console.log('📊 Checking existing venues...');
    const existingVenues = await prisma.venue.findMany({
      select: {
        id: true,
        name: true,
        city: true
      }
    });
    const existingVenueIds = new Set(existingVenues.map(v => v.id));
    console.log(`📍 Found ${existingVenueIds.size} existing venues`);

    // 3. Process countries and fetch venues
    let totalNewVenues = 0;
    let totalUpdatedVenues = 0;
    let totalSkippedVenues = 0;
    let processedCountries = 0;

    for (const country of countries) {
      processedCountries++;
      const progress = `[${processedCountries}/${countries.length}]`;
      
      console.log(`\n${progress} 🌍 ${country.name} (${country.code})`);

      try {
        // Fetch venues by country from API
        console.log(`📡 Fetching venues for ${country.name}...`);
        const apiVenues: ApiVenue[] = await apiFootballService.getVenues(country.name);
        
        console.log(`📥 Received ${apiVenues.length} venues from API`);

        if (apiVenues.length === 0) {
          console.log('⚠️ No venues returned from API');
          continue;
        }

        // 4. Process each venue
        for (const apiVenue of apiVenues) {
          try {
            if (existingVenueIds.has(apiVenue.id)) {
              // Check if we need to update existing venue data
              const existingVenue = await prisma.venue.findUnique({
                where: { id: apiVenue.id }
              });

              if (existingVenue) {
                // Update if missing data
                const needsUpdate = !existingVenue.city || !existingVenue.capacity || 
                                  !existingVenue.address || !existingVenue.imageUrl;
                
                if (needsUpdate) {
                  await prisma.venue.update({
                    where: { id: apiVenue.id },
                    data: {
                      name: apiVenue.name,
                      city: apiVenue.city || existingVenue.city,
                      capacity: apiVenue.capacity || existingVenue.capacity,
                      address: apiVenue.address || existingVenue.address,
                      surface: apiVenue.surface || existingVenue.surface,
                      imageUrl: apiVenue.image || existingVenue.imageUrl,
                      updatedAt: new Date()
                    }
                  });
                  totalUpdatedVenues++;
                  console.log(`🔄 Updated venue: ${apiVenue.name} (${apiVenue.city})`);
                } else {
                  totalSkippedVenues++;
                }
              }
            } else {
              // Create new venue
              await prisma.venue.create({
                data: {
                  id: apiVenue.id,
                  name: apiVenue.name,
                  city: apiVenue.city,
                  capacity: apiVenue.capacity,
                  address: apiVenue.address,
                  surface: apiVenue.surface,
                  imageUrl: apiVenue.image,
                  createdAt: new Date(),
                  updatedAt: new Date()
                }
              });
              
              totalNewVenues++;
              existingVenueIds.add(apiVenue.id); // Add to set for future iterations
              console.log(`➕ Added venue: ${apiVenue.name} (${apiVenue.city})`);
            }
          } catch (venueError) {
            console.error(`❌ Error processing venue ${apiVenue.id} (${apiVenue.name}):`, venueError);
          }
        }

        // Add delay to respect API rate limits
        if (processedCountries < countries.length) {
          console.log('⏳ Waiting 2 seconds before next API call...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (countryError) {
        console.error(`❌ Error fetching venues for ${country.name}:`, countryError);
        continue;
      }
    }

    // 5. Final summary
    console.log('\n🎉 Venue seeding completed!');
    console.log(`📊 Summary:`);
    console.log(`   Countries processed: ${processedCountries}`);
    console.log(`   New venues added: ${totalNewVenues}`);
    console.log(`   Venues updated: ${totalUpdatedVenues}`);
    console.log(`   Venues skipped (up to date): ${totalSkippedVenues}`);
    console.log(`   Total venues in database: ${existingVenueIds.size + totalNewVenues}`);

    if (totalNewVenues > 0 || totalUpdatedVenues > 0) {
      console.log('\n✨ Venue data has been refreshed successfully!');
    }

  } catch (error) {
    console.error('❌ Venue seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

// Run the seeding
if (require.main === module) {
  seedVenues()
    .then(() => {
      console.log('✅ Venue seeding script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Venue seeding script failed:', error);
      process.exit(1);
    });
}

export { seedVenues };
