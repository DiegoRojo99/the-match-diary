import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/server-auth';
import { IdRouteParams } from '@/types/api/params';

export async function DELETE(
  request: NextRequest,
  { params }: IdRouteParams
) {
  const userId = await getUserFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const userMatch = await prisma.userMatch.findUnique({
      where: { id },
    });

    if (!userMatch) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }

    if (userMatch.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.userMatch.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user match:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
