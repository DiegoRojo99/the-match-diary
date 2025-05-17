import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/generated/client';
const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  
  const visitId = params.id;
  if (!visitId) return new Response('Visit ID is required', { status: 400 });

  const matchVisit = await prisma.matchVisit.findUnique({
    where: { id: visitId },
    include: {
      match: {
        include: {
          homeTeam: true,
          awayTeam: true,
          competition: true,
          stadium: true,
          season: true,
        },
      },
      photos: true,
    },
  });

  if (!matchVisit) return new Response('Not found', { status: 404 });

  return Response.json(matchVisit);
}
