import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/server-auth';

export interface UserMatchResponse {
  id: string;
  match_id: number;
  attended_date: string;
  rating: number | null;
  notes: string | null;
  seat_section: string | null;
  ticket_price: number | null;
  currency: string | null;
  weather: string | null;
  match: {
    id: number;
    match_date: string;
    status: string | null;
    home_score: number | null;
    away_score: number | null;
    home_team: { id: number; name: string; logo: string | null } | null;
    away_team: { id: number; name: string; logo: string | null } | null;
    venue: { id: number; name: string; city: string | null } | null;
    competition: { id: number; name: string; logo: string | null } | null;
  } | null;
}

export async function GET(request: NextRequest) {
  const userId = await getUserFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userMatches = await prisma.userMatch.findMany({
      where: { userId },
      orderBy: { attendedDate: 'desc' },
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
            venue: { include: { city: true } },
            competition: true,
          },
        },
      },
    });

    const result: UserMatchResponse[] = userMatches.map((um) => ({
      id: um.id,
      match_id: um.matchId!,
      attended_date: um.attendedDate.toISOString(),
      rating: um.rating,
      notes: um.notes,
      seat_section: um.seatSection,
      ticket_price: um.ticketPrice ? Number(um.ticketPrice) : null,
      currency: um.currency,
      weather: um.weather,
      match: um.match
        ? {
            id: um.match.id,
            match_date: um.match.matchDate.toISOString(),
            status: um.match.statusShort,
            home_score: um.match.homeScore,
            away_score: um.match.awayScore,
            home_team: um.match.homeTeam
              ? { id: um.match.homeTeam.id, name: um.match.homeTeam.name, logo: um.match.homeTeam.logoUrl }
              : null,
            away_team: um.match.awayTeam
              ? { id: um.match.awayTeam.id, name: um.match.awayTeam.name, logo: um.match.awayTeam.logoUrl }
              : null,
            venue: um.match.venue
              ? { id: um.match.venue.id, name: um.match.venue.name, city: um.match.venue.city?.name ?? null }
              : null,
            competition: um.match.competition
              ? { id: um.match.competition.id, name: um.match.competition.name, logo: um.match.competition.logoUrl }
              : null,
          }
        : null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching user matches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = await getUserFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { match_id, attended_date, rating, notes, seat_section, ticket_price, currency, weather } = body;

    if (!match_id || typeof match_id !== 'number') {
      return NextResponse.json({ error: 'Invalid match_id' }, { status: 400 });
    }

    const matchExists = await prisma.match.findUnique({ where: { id: match_id } });
    if (!matchExists) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const userMatch = await prisma.userMatch.upsert({
      where: { userId_matchId: { userId, matchId: match_id } },
      update: {
        attendedDate: attended_date ? new Date(attended_date) : new Date(),
        rating: rating ?? null,
        notes: notes ?? null,
        seatSection: seat_section ?? null,
        ticketPrice: ticket_price ?? null,
        currency: currency ?? 'EUR',
        weather: weather ?? null,
        updatedAt: new Date(),
      },
      create: {
        userId,
        matchId: match_id,
        attendedDate: attended_date ? new Date(attended_date) : new Date(),
        rating: rating ?? null,
        notes: notes ?? null,
        seatSection: seat_section ?? null,
        ticketPrice: ticket_price ?? null,
        currency: currency ?? 'EUR',
        weather: weather ?? null,
      },
    });

    return NextResponse.json({ id: userMatch.id, match_id: userMatch.matchId }, { status: 201 });
  } catch (error) {
    console.error('Error logging match visit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
