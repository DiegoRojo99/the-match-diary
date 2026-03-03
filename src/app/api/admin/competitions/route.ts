import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CompetitionRow, CompetitionWithCountry, CountryRow } from '@/types';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // For now, skip auth check - we'll handle this at the component level
    // TODO: Add proper server-side auth check if needed

    // Fetch all competitions with their country information
    const { data: competitionData, error } = await supabase
      .from('competitions')  
      .select(`
        *,
        country: countries (*)
      `)
      .order('name');

    if (error) {
      console.error('Error fetching competitions:', error);
      return NextResponse.json({ error: 'Failed to fetch competitions' }, { status: 500 });
    }

    // Group competitions by country
    const competitions = competitionData as CompetitionWithCountry[] || [];
    const grouped = competitions.reduce((acc, comp) => {
      const countryKey = comp.country?.name || 'World';
      
      if (!acc[countryKey]) {
        acc[countryKey] = {
          country: comp.country || { id: 0, name: 'World', code: 'WRD' } as CountryRow,
          competitions: []
        };
      }
      
      acc[countryKey].competitions.push(comp);      
      return acc;
    }, {} as Record<string, { country: CountryRow; competitions: CompetitionWithCountry[] }>);

    // Convert to array and sort countries
    const result = Object.entries(grouped)
      .map(([_, value]) => value)
      .sort((a, b) => {
        // Put "World" first, then alphabetical
        if (a.country.name === 'World' || !a.country.name) return -1;
        if (b.country.name === 'World' || !b.country.name) return 1;
        return a.country.name.localeCompare(b.country.name);
      });

    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error in competitions API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}