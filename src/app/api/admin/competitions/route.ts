import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // For now, skip auth check - we'll handle this at the component level
    // TODO: Add proper server-side auth check if needed

    // Fetch all competitions with their country information
    const { data: competitions, error } = await supabase
      .from('competitions')  
      .select(`
        id,
        api_id,
        name,
        type,
        visible,
        seeded,
        countries (
          id,
          name,
          code
        )
      `)
      .order('name');

    if (error) {
      console.error('Error fetching competitions:', error);
      return NextResponse.json({ error: 'Failed to fetch competitions' }, { status: 500 });
    }

    // Group competitions by country
    const grouped = competitions.reduce((acc, comp) => {
      const countryKey = comp.countries?.name || 'World';
      
      if (!acc[countryKey]) {
        acc[countryKey] = {
          country: comp.countries || { name: 'World', code: null },
          competitions: []
        };
      }
      
      acc[countryKey].competitions.push({
        id: comp.id,
        api_id: comp.api_id,
        name: comp.name,
        type: comp.type,
        visible: comp.visible,
        seeded: comp.seeded
      });
      
      return acc;
    }, {} as Record<string, any>);

    // Convert to array and sort countries
    const result = Object.entries(grouped)
      .map(([countryName, data]) => ({
        countryName,
        ...data
      }))
      .sort((a, b) => {
        // Put "World" first, then alphabetical
        if (a.countryName === 'World') return -1;
        if (b.countryName === 'World') return 1;
        return a.countryName.localeCompare(b.countryName);
      });

    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error in competitions API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}