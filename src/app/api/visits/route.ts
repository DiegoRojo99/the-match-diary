import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PrismaClient } from '@prisma/generated/client';
import { MatchVisitWithDetails } from '@/types/includeDB';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const visits: MatchVisitWithDetails[] = await prisma.matchVisit.findMany({
    where: { userId: user.id },
    include: {
      match: {
        include: {
          homeTeam: true,
          awayTeam: true,
          competition: true,
          stadium: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(visits);
}
