import { PrismaClient } from '@prisma/generated/client';

const prisma = new PrismaClient();

const API_KEY = process.env.NEXT_PUBLIC_FOOTBALL_DATA_API_KEY!;
const API_URL = 'https://api.football-data.org/v4/teams';

type ApiTeam = {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  address: string;
  website: string;
  founded: number;
  clubColors: string;
  venue: string;
  area: {
    name: string;
  };
};

async function importTeams(limit: number, offset: number): Promise<void> {
  const res = await fetch(`${API_URL}?limit=${limit}&offset=${offset}`, {
    headers: { 'X-Auth-Token': API_KEY },
  });

  if (!res.ok) throw new Error(`Fetch error: ${res.status}`);

  const data = await res.json();
  const teams: ApiTeam[] = data.teams ?? data;

  for (const team of teams) {
    console.log(`${team.id}) Importing team: ${team.name}`);
    const city = team.address?.split(',').slice(-2, -1)[0]?.trim() ?? null;

    const stadium = await prisma.stadium.upsert({
      where: { id: `stadium_${team.venue || 'Unknown Stadium'}` },
      update: {},
      create: {
        id: `stadium_${team.venue || 'Unknown Stadium'}`,
        name: team.venue || 'Unknown Stadium',
        city,
        country: team.area?.name ?? null,
        address: team.address ?? 'Unknown Address',
      },
    });

    await prisma.team.upsert({
      where: { apiId: team.id },
      update: {},
      create: {
        apiId: team.id,
        name: team.name,
        shortName: team.shortName,
        tla: team.tla,
        crest: team.crest,
        address: team.address,
        website: team.website,
        founded: team.founded,
        clubColors: team.clubColors,
        area: team.area?.name,
        stadiumId: stadium.id,
      },
    });
  }

  console.log(`Imported ${teams.length} teams`);
  await prisma.$disconnect();
}

importTeams(100, 1000).catch((err) => {
  console.error(err);
  prisma.$disconnect();
});