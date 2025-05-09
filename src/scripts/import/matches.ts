import { MatchAPI, MatchTeamAPI } from "@/types/API";
import { PrismaClient } from "../../../prisma/generated/client";

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
  const matches = await fetchMatchesBetweenDates('2025-01-01', '2025-01-11');

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

    const comp = await prisma.competition.upsert({
      where: { id: `api-${competition.id}` },
      update: {},
      create: {
        id: `api-${competition.id}`,
        name: competition.name,
        logoUrl: competition.emblem,
        country: area?.name,
        type: competition.type,
      },
    });

    const seasonId = `season-${season.id}`;

    // Create season if needed
    await prisma.season.upsert({
      where: { id: seasonId },
      update: {},
      create: {
        id: seasonId,
        apiId: season.id,
        startDate: new Date(season.startDate),
        endDate: new Date(season.endDate),
        currentMatchday: season.currentMatchday,
        competition: {
          connect: { id: `api-${competition.id}` },
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
        seasonId: seasonId,
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