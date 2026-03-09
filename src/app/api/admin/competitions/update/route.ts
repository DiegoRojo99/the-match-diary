import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    // For now, skip auth check - we'll handle this at the component level
    // TODO: Add proper server-side auth check if needed

    const body = await request.json();
    const { competitionId, visible } = body;

    if (typeof competitionId !== 'number' || typeof visible !== 'boolean') {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Update competition visibility using Prisma
    await prisma.competition.update({
      where: { id: competitionId },
      data: { visible }
    });

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error in update competition API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}