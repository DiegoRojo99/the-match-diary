// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { apiFootballService } from '@/lib/api-football';
import type { CompetitionTable } from '@/types/db';

// Create Supabase client for seeding
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedCompetitionsFromCountry(countryName: string = 'England') {
  console.log(`🏆 Testing competition seeding from ${countryName}...`);
  
  try {
    // Check existing competitions
    console.log('🔍 Checking existing competitions in database...');
    const { data: existingComps, error: fetchError } = await supabase
      .from('competitions')
      .select('api_id, name');
    
    if (fetchError) {
      throw new Error(`Error fetching existing competitions: ${fetchError.message}`);
    }
    
    const existingIds = new Set(existingComps?.map(c => c.api_id) || []);
    console.log(`📊 Found ${existingIds.size} competitions already in database`);
    
    // Show what we have
    if (existingComps && existingComps.length > 0) {
      console.log('🏆 Existing competitions:');
      existingComps.slice(0, 5).forEach(comp => {
        console.log(`  - ${comp.name} (ID: ${comp.api_id})`);
      });
      if (existingComps.length > 5) {
        console.log(`  ... and ${existingComps.length - 5} more`);
      }
    }

    // Fetch all leagues from the specified country (current season 2024)
    console.log(`📡 Fetching all competitions from ${countryName}...`);
    const leagues = await apiFootballService.getLeagues(countryName, 2024);
    
    console.log(`✅ Retrieved ${leagues.length} leagues from ${countryName} 2024`);
    
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
    } else {
      // Normal country lookup for national competitions
      const { data: country, error: error } = await supabase
        .from('countries')
        .select('id, name, code')
        .or(`code.eq.${apiCountryCode},name.eq.${apiCountryName}`)
        .single();
      
      matchingCountry = country;
      countryError = error;
    }
    
    if (countryError && matchingCountry !== null) {
      console.error('❌ Could not find matching country in database:', countryError);
      console.log(`   API returned: ${apiCountryName} (${apiCountryCode})`);
      
      // Let's see what countries we have available
      const { data: availableCountries } = await supabase
        .from('countries')
        .select('name, code')
        .ilike('name', `%${apiCountryName}%`)
        .limit(5);
      
      if (availableCountries && availableCountries.length > 0) {
        console.log('🔍 Similar countries found:');
        availableCountries.forEach(country => {
          console.log(`   - ${country.name} (${country.code})`);
        });
      }
      return;
    }
    
    if (matchingCountry) {
      console.log(`✅ Found matching country: ${matchingCountry.name} (${matchingCountry.code})`);
    } else {
      console.log(`✅ Treating as international/European competitions (no country)`);
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
    const dbCompetitions: CompetitionTable['Insert'][] = newLeagues.map(league => ({
      api_id: league.league?.id!,
      name: league.league?.name!,
      country_id: matchingCountry?.id || null,
      logo_url: league.league?.logo || null,
      type: league.league?.type || 'League'
    }));
    
    console.log(`💾 Inserting ${dbCompetitions.length} competitions from ${countryName}...`);
    
    // Insert in smaller batches to avoid overwhelming the database
    const batchSize = 10;
    let inserted = 0;
    
    for (let i = 0; i < dbCompetitions.length; i += batchSize) {
      const batch = dbCompetitions.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('competitions')
        .insert(batch);
      
      if (insertError) {
        console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, insertError);
        throw insertError;
      }
      
      inserted += batch.length;
      console.log(`⚡ Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(dbCompetitions.length/batchSize)} (${inserted}/${dbCompetitions.length})`);
    }
    
    console.log(`🎉 Successfully inserted ${inserted} competitions from ${countryName}!`);
    
    // Show some of the inserted competitions
    console.log('🏆 Sample inserted competitions:');
    dbCompetitions.slice(0, 5).forEach(comp => {
      console.log(`  - ${comp.name} (API ID: ${comp.api_id}) - Type: ${comp.type}`);
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
    await seedCompetitionsFromCountry('World');
    
    console.log('='.repeat(50));
    console.log('✅ Competition seeding completed successfully!');
    
  } catch (error) {
    console.error('💥 Competition seeding failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { seedCompetitionsFromCountry };