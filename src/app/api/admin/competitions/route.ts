import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // For now, skip auth check - we'll handle this at the component level
    // TODO: Add proper server-side auth check if needed

    // Fetch all competitions with their country information using Prisma
    const competitions = await prisma.competition.findMany({
      include: {
        country: true
      },
      orderBy: { name: 'asc' }
    });

    // Group competitions by country
    const grouped = competitions.reduce((acc, comp) => {
      const countryKey = comp.country?.name || 'World';
      
      if (!acc[countryKey]) {
        acc[countryKey] = {
          country: comp.country || { id: 0, name: 'World', code: 'WRD', flag: null },
          competitions: []
        };
      }
      
      acc[countryKey].competitions.push(comp);
      return acc;
    }, {} as Record<string, { country: any; competitions: any[] }>);

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