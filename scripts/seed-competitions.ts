// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { apiFootballService } from '@/lib/api-football';

// Create Prisma client for seeding with PG adapter
const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  log: ['error', 'warn'],
  adapter
});

async function seedCompetitionsFromCountry(countryName: string = 'England') {
  console.log(`🏆 Testing competition seeding from ${countryName}...`);
  
  try {
    // Check existing competitions
    console.log('🔍 Checking existing competitions in database...');
    const existingComps = await prisma.competition.findMany({
      select: {
        id: true,
        name: true
      }
    });
    
    const existingIds = new Set(existingComps.map(c => c.id));
    console.log(`📊 Found ${existingIds.size} competitions already in database`);

    // Fetch all leagues from the specified country (current season 2025)
    console.log(`📡 Fetching all competitions from ${countryName}...`);
    const leagues = await apiFootballService.getLeagues(countryName, 2025);
    console.log(`✅ Retrieved ${leagues.length} leagues from ${countryName} 2025`);
    
    if (leagues.length === 0) {
      console.log(`❌ No leagues found for ${countryName}`);
      return;
    }
    
    // Show available leagues
    console.log('🔍 Available leagues:');
    leagues.slice(0, 10).forEach(league => {
      console.log(`  - ${league.league?.name} (ID: ${league.league?.id}) - Type: ${league.league?.type}`);
    });
    if (leagues.length > 10) {
      console.log(`  ... and ${leagues.length - 10} more`);
    }

    // Get the country ID from our database using the first league's country info
    const apiCountryCode = leagues[0]?.country?.code;
    const apiCountryName = leagues[0]?.country?.name;
    
    console.log(`🔍 Looking up country: ${apiCountryName} (${apiCountryCode})`);
    
    let matchingCountry;
    let countryError;
    
    // Handle European competitions (Champions League, Europa League, etc.) which might not have a country
    if (!apiCountryCode || !apiCountryName || apiCountryName.toLowerCase() === 'world') {
      console.log('🌍 No specific country found - treating as international/European competitions');
      // For European/International competitions, we'll set country_id to null
      matchingCountry = null;
      countryError = null;
    } 
    else {
      // Normal country lookup for national competitions
      const country = await prisma.country.findFirst({
        where: {
          OR: [
            { code: apiCountryCode },
            { name: apiCountryName }
          ]
        },
        select: {
          id: true,
          name: true,
          code: true
        }
      });
      
      matchingCountry = country;
      countryError = country ? null : new Error('Country not found');
    }
    
    if (countryError && matchingCountry !== null) {
      console.error('❌ Could not find matching country in database:', countryError);
      console.log(`   API returned: ${apiCountryName} (${apiCountryCode})`);
      
      // Let's see what countries we have available
      const availableCountries = await prisma.country.findMany({
        where: {
          name: {
            contains: apiCountryName,
            mode: 'insensitive'
          }
        },
        select: {
          name: true,
          code: true
        },
        take: 5
      });
      
      if (availableCountries && availableCountries.length > 0) {
        console.log('🔍 Similar countries found:');
        availableCountries.forEach(country => {
          console.log(`   - ${country.name} (${country.code})`);
        });
      }
      return;
    }
    
    // Filter out leagues that already exist and prepare for insertion
    const newLeagues = leagues.filter(league => 
      league.league?.id && !existingIds.has(league.league.id)
    );
    
    console.log(`🔄 Found ${newLeagues.length} new competitions to add (from ${leagues.length} total)`);
    
    if (newLeagues.length === 0) {
      console.log(`ℹ️  All competitions from ${countryName} already exist in database`);
      return;
    }
    
    // Transform to database format
    const dbCompetitions = newLeagues.map(league => ({
      id: league.league?.id!,
      name: league.league?.name!,
      countryId: matchingCountry?.id || null,
      logoUrl: league.league?.logo || null,
      type: league.league?.type || 'League'
    }));
    
    console.log(`💾 Inserting ${dbCompetitions.length} competitions from ${countryName}...`);
    
    // Insert in smaller batches to avoid overwhelming the database
    const batchSize = 10;
    let inserted = 0;
    
    for (let i = 0; i < dbCompetitions.length; i += batchSize) {
      const batch = dbCompetitions.slice(i, i + batchSize);
      
      try {
        await prisma.competition.createMany({
          data: batch,
          skipDuplicates: true
        });
        
        inserted += batch.length;
        console.log(`⚡ Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(dbCompetitions.length/batchSize)} (${inserted}/${dbCompetitions.length})`);
      } catch (insertError) {
        console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, insertError);
        throw insertError;
      }
    }
    
    console.log(`🎉 Successfully inserted ${inserted} competitions from ${countryName}!`);
    
    // Show some of the inserted competitions
    console.log('🏆 Sample inserted competitions:');
    dbCompetitions.slice(0, 5).forEach(comp => {
      console.log(`  - ${comp.name} (ID: ${comp.id}) - Type: ${comp.type}`);
    });
    if (dbCompetitions.length > 5) {
      console.log(`  ... and ${dbCompetitions.length - 5} more`);
    }
    
  } catch (error) {
    console.error('❌ Error seeding competition:', error);
    throw error;
  }
}

// Main execution
async function main() {
  console.log('🚀 Competition Seeding from Country');
  console.log('='.repeat(50));
  
  try {
    // Seed European/International competitions first
    const alreadySeeded : string[] = [
    ];

    const nextToSeed: string[] = [
      'England', 'Spain', 'Italy', 'Germany', 'France', 
      'Netherlands', 'Portugal', 'World', 'Ireland',      
      'Belgium', 'Turkey', 'Russia', 'Ukraine', 'Greece',
      'Scotland', 'Denmark', 'Sweden', 'Norway', 'Switzerland'      
    ];

    for (const country of nextToSeed) {
      await seedCompetitionsFromCountry(country);
    }
    
    console.log('='.repeat(50));
    console.log('✅ Competition seeding completed successfully!');
    
  } catch (error) {
    console.error('💥 Competition seeding failed:', error);
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

export { seedCompetitionsFromCountry };