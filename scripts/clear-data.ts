// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Create Prisma client with PG adapter using direct URL
const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  log: ['error', 'warn'],
  adapter
});

async function clearData() {
  console.log('🧹 Clearing existing data to prepare for new schema...');

  try {
    // Delete in order to respect foreign key constraints
    console.log('🗑️  Deleting user matches...');
    await prisma.userMatch.deleteMany({});
    
    console.log('🗑️  Deleting user venues...');
    await prisma.userVenue.deleteMany({});
    
    console.log('🗑️  Deleting matches...');
    await prisma.match.deleteMany({});
    
    console.log('🗑️  Deleting teams...');
    await prisma.team.deleteMany({});
    
    console.log('🗑️  Deleting venues...');
    await prisma.venue.deleteMany({});
    
    console.log('🗑️  Deleting competitions...');
    await prisma.competition.deleteMany({});
    
    // Keep countries and cities as they don't have api_id issues
    console.log('ℹ️  Keeping countries and cities (they use proper IDs)');
    
    console.log('✅ Data clearing completed successfully!');
    
    // Show what's left
    const remainingData = await prisma.country.count();
    const remainingCities = await prisma.city.count();
    
    console.log(`📊 Remaining data:`);
    console.log(`  - ${remainingData} countries`);
    console.log(`  - ${remainingCities} cities`);

  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

// Main execution
async function main() {
  console.log('🧹 Data Clearing for Schema Migration');
  console.log('='.repeat(50));
  
  try {
    await clearData();
    console.log('='.repeat(50));
    console.log('✅ Data clearing completed!');
    console.log('💡 Next steps:');
    console.log('   1. Run: npx prisma db push');
    console.log('   2. Run: npx tsx scripts/seed-competitions.ts');
    console.log('   3. Run: npx tsx scripts/seed-teams-venues.ts');
  } catch (error) {
    console.error('❌ Data clearing failed:', error);
    process.exit(1);
  }
}

main();