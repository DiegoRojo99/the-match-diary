import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserDataFromRequest, ensureUserExists } from '@/lib/server-auth';
import { UserMatchWithMatch, UserMatchWithMatchSerialized } from '@/types/prisma/match';
import { Match, UserMatch, Team, Competition, Venue } from '@prisma/client';

// Serialization helpers
function serializeUserMatchWithMatch(userMatch: UserMatchWithMatch): UserMatchWithMatchSerialized {
  return {
    ...userMatch,
    attendedDate: userMatch.attendedDate.toISOString(),
    createdAt: userMatch.createdAt.toISOString(),
    updatedAt: userMatch.updatedAt.toISOString(),
    match: userMatch.match ? {
      ...userMatch.match,
      matchDate: userMatch.match.matchDate.toISOString(),
      createdAt: userMatch.match.createdAt.toISOString(),
      updatedAt: userMatch.match.updatedAt.toISOString(),
    } : null
  };
}

export async function GET(request: NextRequest) {
  const userData = await getUserDataFromRequest(request);
  if (!userData) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Ensure user exists in our local database
  await ensureUserExists(userData);

  const userId = userData.id;

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
    }) as UserMatchWithMatch[];

    return NextResponse.json(userMatches.map(serializeUserMatchWithMatch));
  } catch (error) {
    console.error('Error fetching user matches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userData = await getUserDataFromRequest(request);
  if (!userData) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Ensure user exists in our local database
  await ensureUserExists(userData);

  const userId = userData.id;

  try {
    const body = await request.json();
    const { match_id, attended_date, rating, notes } = body;

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
        updatedAt: new Date(),
      },
      create: {
        userId,
        matchId: match_id,
        attendedDate: attended_date ? new Date(attended_date) : new Date(),
        rating: rating ?? null,
        notes: notes ?? null,
      },
    });

    return NextResponse.json({ id: userMatch.id, match_id: userMatch.matchId }, { status: 201 });
  } catch (error) {
    console.error('Error logging match visit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
