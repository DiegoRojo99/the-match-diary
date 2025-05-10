import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../prisma/generated/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const competitions = await prisma.competition.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(competitions);
  } 
  catch (error) {
    console.error('[GET_COMPETITIONS]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
