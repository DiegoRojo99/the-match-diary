import { PrismaClient } from '@prisma/generated/client';
import { fallbackExtractCity } from '../address/addressBreakdown';

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
    const city = fallbackExtractCity(team.address);

    const stadium = await prisma.stadium.upsert({
      where: { id: `stadium_${team.venue || 'Unknown Stadium'}` },
      update: {},
      create: {
        id: `stadium_${team.venue || 'Unknown Stadium'}`,
        name: team.venue || 'Unknown Stadium',
        city,
        country: null,
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
        stadiumId: stadium.id,
        city,
        country: null,
      },
    });
  }

  console.log(`Imported ${teams.length} teams`);
  await prisma.$disconnect();
}

importTeams(10, 0).catch((err) => {
  console.error(err);
  prisma.$disconnect();
});