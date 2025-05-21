import { PrismaClient } from '@prisma/generated/client';
import { extractCityFromAddress } from '../address/addressBreakdown';

const prisma = new PrismaClient();

const API_KEY = process.env.NEXT_PUBLIC_FOOTBALL_DATA_API_KEY!;

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

async function importTeams(competitionId: string): Promise<void> {
  const res = await fetch(`https://api.football-data.org/v4/competitions/${competitionId}/teams`, {
    headers: { 'X-Auth-Token': API_KEY },
  });

  if (!res.ok) throw new Error(`Fetch error: ${res.status}`);

  const data = await res.json();
  const teams: ApiTeam[] = data.teams ?? data;

  for (const team of teams) {
    console.log(`${team.id}) Importing team: ${team.name}`);

    const city = await extractCityFromAddress(team.address);
    console.log(`Extracted city: ${city}`);
    const country = team.area?.name ?? null;
    
    const updateData: { [key: string]: string } = {};
    if (city != null) updateData.city = city;
    if (country != null) updateData.country = country;

    const stadium = await prisma.stadium.upsert({
      where: { id: `stadium_${team.venue || 'Unknown Stadium'}` },
      update: updateData,
      create: {
        id: `stadium_${team.venue || 'Unknown Stadium'}`,
        name: team.venue || 'Unknown Stadium',
        city,
        country,
        address: team.address ?? 'Unknown Address',
      },
    });

    await prisma.team.upsert({
      where: { apiId: team.id },
      update: updateData,
      create: {
        apiId: team.id,
        name: team.name,
        shortName: team.shortName,
        tla: team.tla,
        crest: team.crest,
        address: team.address,
        city,
        country,
        website: team.website,
        founded: team.founded,
        clubColors: team.clubColors,
        stadiumId: stadium.id,
      },
    });
  }

  console.log(`Imported ${teams.length} teams`);
  await prisma.$disconnect();
}

importTeams('BSA').catch((err) => {
  console.error(err);
  prisma.$disconnect();
});