import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const countryId = searchParams.get('country');
    const type = searchParams.get('type');

    const where: Record<string, unknown> = { visible: true };

    if (query && query.trim().length >= 2) {
      where.OR = [
        { name: { contains: query.trim(), mode: 'insensitive' } },
        { country: { name: { contains: query.trim(), mode: 'insensitive' } } },
      ];
    }

    if (countryId) {
      const parsedCountryId = parseInt(countryId);
      if (!isNaN(parsedCountryId)) {
        where.countryId = parsedCountryId;
      }
    }

    if (type && (type === 'League' || type === 'Cup')) {
      where.type = type;
    }

    const competitions = await prisma.competition.findMany({
      where,
      include: { country: true },
      orderBy: [{ country: { name: 'asc' } }, { name: 'asc' }],
      take: 100,
    });

    return NextResponse.json(competitions);
  } catch (error) {
    console.error('Error in competitions API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
