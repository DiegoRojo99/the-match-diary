// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { apiFootballService } from '@/lib/api-football';
import type { ApiCountry } from '@/types/api/countries';
import type { CountryTable } from '@/types/db';

// Create Supabase client for seeding
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin operations
);

async function seedCountries() {
  console.log('🌍 Starting countries seeding...');
  
  try {
    // First, check existing countries in database to avoid unnecessary API calls
    console.log('🔍 Checking existing countries in database...');
    const { data: existingCountries, error: fetchError } = await supabase
      .from('countries')
      .select('code');
    
    if (fetchError) {
      throw new Error(`Error fetching existing countries: ${fetchError.message}`);
    }
    
    const existingCodes = new Set(existingCountries?.map(c => c.code) || []);
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
      const dbCountries: CountryTable['Insert'][] = apiCountries
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
        
        const { error: insertError } = await supabase
          .from('countries')
          .insert(batch);
        
        if (insertError) {
          console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, insertError);
          throw insertError;
        }
        
        inserted += batch.length;
        console.log(`⚡ Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(dbCountries.length/batchSize)} (${inserted}/${dbCountries.length})`);
      }
      
      console.log(`🎉 Successfully seeded ${inserted} countries!`);
    } else {
      console.log('ℹ️  Countries table already has data, skipping API fetch to save quota');
    }
    
    // Show final stats
    const { data: totalCountries } = await supabase
      .from('countries')
      .select('id', { count: 'exact' });
    
    console.log(`📊 Total countries in database: ${totalCountries?.length || 0}`);
    
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
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { seedCountries };