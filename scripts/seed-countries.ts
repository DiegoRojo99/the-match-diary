// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { apiFootballService } from '@/lib/api-football';
import type { ApiCountry } from '@/types/api/countries';

// Create Prisma client for seeding with PG adapter
const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  log: ['error', 'warn'],
  adapter
});

async function seedCountries() {
  console.log('🌍 Starting countries seeding...');
  
  try {
    // First, check existing countries in database to avoid unnecessary API calls
    console.log('🔍 Checking existing countries in database...');
    const existingCountries = await prisma.country.findMany({
      select: {
        code: true
      }
    });
    
    const existingCodes = new Set(existingCountries.map(c => c.code));
    console.log(`📊 Found ${existingCodes.size} countries already in database`);
    
    // Only fetch from API if we need to add countries
    if (existingCodes.size === 0) {
      console.log('📡 Fetching countries from API...');
      const apiCountries: ApiCountry[] = await apiFootballService.getCountries();
      
      console.log(`✅ Retrieved ${apiCountries.length} countries from API`);
      
      // Debug: Show first few countries
      console.log('🔍 Sample countries:');
      apiCountries.slice(0, 3).forEach(country => {
        console.log(`  - ${country.name} (${country.code}) - Flag: ${country.flag ? 'Yes' : 'No'}`);
      });

      // Transform API data to database format, only filtering null codes
      const dbCountries = apiCountries
        .filter(country => {
          if (!country.code) {
            console.log(`⚠️  Skipping ${country.name}: null code`);
            return false;
          }
          return true;
        })
        .map((country) => ({
          name: country.name,
          code: country.code,
          flag: country.flag
        }));
      
      console.log(`🔄 Processing ${dbCountries.length} valid countries (filtered from ${apiCountries.length})`);
      
      if (dbCountries.length === 0) {
        console.log('ℹ️  No valid countries to insert');
        return;
      }

      console.log(`💾 Inserting ${dbCountries.length} new countries...`);
      
      // Insert countries in smaller batches
      const batchSize = 50;
      let inserted = 0;
      
      for (let i = 0; i < dbCountries.length; i += batchSize) {
        const batch = dbCountries.slice(i, i + batchSize);
        
        try {
          await prisma.country.createMany({
            data: batch,
            skipDuplicates: true
          });
          
          inserted += batch.length;
          console.log(`⚡ Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(dbCountries.length/batchSize)} (${inserted}/${dbCountries.length})`);
        } catch (insertError) {
          console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, insertError);
          throw insertError;
        }
      }
      
      console.log(`🎉 Successfully seeded ${inserted} countries!`);
    } else {
      console.log('ℹ️  Countries table already has data, skipping API fetch to save quota');
    }
    
    // Show final stats
    const totalCountries = await prisma.country.count();
    
    console.log(`📊 Total countries in database: ${totalCountries}`);
    
  } catch (error) {
    console.error('❌ Error seeding countries:', error);
    throw error;
  }
}

// Main execution
async function main() {
  console.log('🚀 Database seeding started');
  console.log('='.repeat(50));
  
  try {
    await seedCountries();
    
    console.log('='.repeat(50));
    console.log('✅ Database seeding completed successfully!');
    
  } catch (error) {
    console.error('💥 Database seeding failed:', error);
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

export { seedCountries };