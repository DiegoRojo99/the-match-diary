// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Create Prisma client for seeding with PG adapter
const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  log: ['error', 'warn'],
  adapter
});

async function updateIncompleteVenues() {
  console.log('🏟️ Starting venue data completion...');
  
  try {
    // Find all venues missing capacity, address, or surface data
    console.log('🔍 Finding venues with incomplete data...');
    const incompleteVenues = await prisma.venue.findMany({
      where: {
        OR: [
          { capacity: null },
          { address: null },
          { surface: null },
          { imageUrl: null }
        ]
      },
      orderBy: {
        id: 'asc'
      }
    });

    if (incompleteVenues.length === 0) {
      console.log('✅ All venues already have complete data!');
      return;
    }

    console.log(`📊 Found ${incompleteVenues.length} venues with incomplete data:`);
    incompleteVenues.slice(0, 10).forEach((venue, idx) => {
      const missing = [];
      if (!venue.capacity) missing.push('capacity');
      if (!venue.address) missing.push('address');
      if (!venue.surface) missing.push('surface');
      if (!venue.imageUrl) missing.push('image');
      
      console.log(`  ${idx + 1}. ${venue.name} (${venue.city}) - Missing: ${missing.join(', ')}`);
    });
    
    if (incompleteVenues.length > 10) {
      console.log(`  ... and ${incompleteVenues.length - 10} more venues`);
    }

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Process venues in batches to respect API rate limits
    const batchSize = 10;
    for (let i = 0; i < incompleteVenues.length; i += batchSize) {
      const batch = incompleteVenues.slice(i, i + batchSize);
      const batchProgress = `[${Math.floor(i / batchSize) + 1}/${Math.ceil(incompleteVenues.length / batchSize)}]`;
      
      console.log(`\n${batchProgress} Processing batch of ${batch.length} venues...`);

      for (const venue of batch) {
        try {
          const progress = `[${i + batch.indexOf(venue) + 1}/${incompleteVenues.length}]`;
          console.log(`${progress} 🔄 Updating ${venue.name}...`);

          // Get venue details from API using venue ID
          const apiVenues = await fetch(`https://v3.football.api-sports.io/venues?id=${venue.id}`, {
            headers: {
              'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
              'X-RapidAPI-Host': 'v3.football.api-sports.io',
            },
          });

          if (!apiVenues.ok) {
            console.error(`  ❌ API request failed for venue ${venue.id}: ${apiVenues.status}`);
            errorCount++;
            continue;
          }

          const apiData = await apiVenues.json();
          
          // Log API quota usage
          const remaining = apiVenues.headers.get('x-ratelimit-requests-remaining');
          const quota = apiVenues.headers.get('x-ratelimit-requests-limit');
          if (remaining && quota) {
            console.log(`    📊 API Quota: ${remaining}/${quota} remaining`);
          }

          if (!apiData.response || apiData.response.length === 0) {
            console.log(`  ⚠️ No data returned for venue ${venue.id}`);
            skippedCount++;
            continue;
          }

          const apiVenue = apiData.response[0];
          
          // Prepare update data with only missing fields
          const updateData: any = {
            updatedAt: new Date()
          };

          let hasUpdates = false;

          if (!venue.capacity && apiVenue.capacity) {
            updateData.capacity = apiVenue.capacity;
            hasUpdates = true;
            console.log(`    ✓ Adding capacity: ${apiVenue.capacity}`);
          }

          if (!venue.address && apiVenue.address) {
            updateData.address = apiVenue.address;
            hasUpdates = true;
            console.log(`    ✓ Adding address: ${apiVenue.address}`);
          }

          if (!venue.surface && apiVenue.surface) {
            updateData.surface = apiVenue.surface;
            hasUpdates = true;
            console.log(`    ✓ Adding surface: ${apiVenue.surface}`);
          }

          if (!venue.imageUrl && apiVenue.image) {
            updateData.imageUrl = apiVenue.image;
            hasUpdates = true;
            console.log(`    ✓ Adding image URL`);
          }

          // Also update city if it's more detailed in the API
          if (apiVenue.city && (!venue.city || venue.city.length < apiVenue.city.length)) {
            updateData.city = apiVenue.city;
            hasUpdates = true;
            console.log(`    ✓ Updating city: ${venue.city} -> ${apiVenue.city}`);
          }

          if (hasUpdates) {
            await prisma.venue.update({
              where: { id: venue.id },
              data: updateData
            });

            updatedCount++;
            console.log(`    ✅ Updated ${venue.name}`);
          } else {
            console.log(`    ℹ️ No additional data available for ${venue.name}`);
            skippedCount++;
          }

        } catch (venueError) {
          console.error(`  ❌ Error updating venue ${venue.id} (${venue.name}):`, venueError);
          errorCount++;
        }
      }

      // Add delay between batches to respect API rate limits
      if (i + batchSize < incompleteVenues.length) {
        console.log('  ⏳ Waiting 5 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // Final summary
    console.log('\n🎉 Venue data completion finished!');
    console.log(`📊 Summary:`);
    console.log(`   Venues processed: ${incompleteVenues.length}`);
    console.log(`   Venues updated: ${updatedCount}`);
    console.log(`   Venues skipped (no additional data): ${skippedCount}`);
    console.log(`   Errors encountered: ${errorCount}`);
    
    if (updatedCount > 0) {
      console.log('\n✨ Venue data has been enriched successfully!');
    }

    if (errorCount > 0) {
      console.log(`\n⚠️ ${errorCount} venues encountered errors. You may want to retry the script later.`);
    }

    // Show final stats of complete vs incomplete venues
    const finalIncompleteCount = await prisma.venue.count({
      where: {
        OR: [
          { capacity: null },
          { address: null },
          { surface: null },
          { imageUrl: null }
        ]
      }
    });

    const totalVenues = await prisma.venue.count();
    const completeVenues = totalVenues - finalIncompleteCount;
    
    console.log(`\n📈 Final venue completion status:`);
    console.log(`   Total venues: ${totalVenues}`);
    console.log(`   Complete venues: ${completeVenues} (${Math.round((completeVenues / totalVenues) * 100)}%)`);
    console.log(`   Incomplete venues: ${finalIncompleteCount} (${Math.round((finalIncompleteCount / totalVenues) * 100)}%)`);

  } catch (error) {
    console.error('❌ Venue data completion failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

// Run the update
if (require.main === module) {
  updateIncompleteVenues()
    .then(() => {
      console.log('✅ Venue data completion script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Venue data completion script failed:', error);
      process.exit(1);
    });
}

export { updateIncompleteVenues };