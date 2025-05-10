import { NextResponse } from 'next/server';
import { PrismaClient, Team } from '../../../../../prisma/generated/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name || name.length < 2) {
    return NextResponse.json([], { status: 200 });
  }

  const teams: Team[] = await prisma.team.findMany({
    where: {
      name: {
        contains: name,
        mode: 'insensitive',
      },
    },
    take: 10,
    orderBy: {
      name: 'asc',
    },
  });

  return NextResponse.json(teams);
}