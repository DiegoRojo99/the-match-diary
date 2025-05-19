import { MatchAPI, MatchTeamAPI } from "@/types/matchesAPI";
import { PrismaClient } from '@prisma/generated/client';

const prisma = new PrismaClient();
const API_KEY = process.env.NEXT_PUBLIC_FOOTBALL_DATA_API_KEY!;
const BASE_URL = 'https://api.football-data.org/v4';

async function fetchMatchesBetweenDates(startDate: string, endDate: string): Promise<MatchAPI[]> {
  const res = await fetch(`${BASE_URL}/matches?dateFrom=${startDate}&dateTo=${endDate}`, {
    headers: {
      'X-Auth-Token': API_KEY,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch matches: ${res.statusText}`);
  }

  const data = await res.json();
  return data.matches;
}

async function importMatches() {
  const matches = await fetchMatchesBetweenDates('2025-05-16', '2025-05-26');

  for (const match of matches) {
    const {
      homeTeam,
      awayTeam,
      competition,
      season,
      utcDate,
      score,
      area
    } = match;

    console.log(`Importing match: ${homeTeam.name} vs ${awayTeam.name} on ${utcDate}`);

    const home = await upsertTeam(homeTeam);
    const away = await upsertTeam(awayTeam);

    const existingComp = await prisma.competition.findFirst({
      where: { name: competition.name },
    });
    const comp = await prisma.competition.upsert({
      where: { id: existingComp?.id },
      update: {},
      create: {
        apiId: competition.id,
        name: competition.name,
        logoUrl: competition.emblem,
        country: area?.name,
        type: competition.type,
      },
    });

    
    // Create season if needed
    const existingSeason = await prisma.season.findFirst({
      where: { apiId: season.id },
    });
    const newSeason = await prisma.season.upsert({
      where: { id: existingSeason?.id },
      update: {},
      create: {
        apiId: season.id,
        startDate: new Date(season.startDate),
        endDate: new Date(season.endDate),
        currentMatchday: season.currentMatchday,
        competition: {
          connect: { id: existingComp?.id ?? comp.id },
        },
      },
    });

    await prisma.match.upsert({
      where: {
        homeTeamId_awayTeamId_date: {
          homeTeamId: home.id,
          awayTeamId: away.id,
          date: new Date(utcDate),
        },
      },
      update: {},
      create: {
        homeTeamId: home.id,
        awayTeamId: away.id,
        date: new Date(utcDate),
        homeScore: score.fullTime.home ?? 0,
        awayScore: score.fullTime.away ?? 0,
        stadiumId: null,
        competitionId: comp.id,
        seasonId: existingSeason?.id ?? newSeason.id,
      },
    });
  }

  console.log(`Imported ${matches.length} matches`);
}

async function upsertTeam(team: MatchTeamAPI) {
  return await prisma.team.upsert({
    where: { apiId: team.id },
    update: {},
    create: {
      apiId: team.id,
      name: team.name,
      shortName: team.shortName,
      tla: team.tla,
      crest: team.crest,
      address: '',
    },
  });
}

if (require.main === module) {
  importMatches().catch(console.error);
}