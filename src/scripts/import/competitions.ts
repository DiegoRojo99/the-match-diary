import { PrismaClient } from '@prisma/generated/client';
import { CompetitionsListItemAPI } from "../../types/competitionsAPI";
const prisma = new PrismaClient();

const API_KEY = process.env.NEXT_PUBLIC_FOOTBALL_DATA_API_KEY!;
const API_URL = "https://api.football-data.org/v4/competitions";

async function importCompetitions() {
  const res = await fetch(API_URL, {
    headers: {
      "X-Auth-Token": API_KEY,
    },
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  const data = await res.json();
  const competitions: CompetitionsListItemAPI[] = data.competitions;

  for (const competition of competitions) {
    const apiId = competition.id;
    const name = competition.name;
    const logoUrl = competition.emblem;
    const country = competition.area?.name;

    // Upsert competition
    const dbCompetition = await prisma.competition.upsert({
      where: { apiId },
      update: {
        name,
        logoUrl,
        country,
        fromApi: competition.plan === "TIER_ONE",
        type: competition.type,
      },
      create: {
        apiId,
        name,
        logoUrl,
        country,
        fromApi: competition.plan === "TIER_ONE",
        type: competition.type,
      },
    });

    // Upsert season if exists
    const season = competition.currentSeason;
    if (season) {
      await prisma.season.upsert({
        where: { apiId: season.id },
        update: {
          startDate: season.startDate ? new Date(season.startDate) : null,
          endDate: season.endDate ? new Date(season.endDate) : null,
          currentMatchday: season.currentMatchday,
          competitionId: dbCompetition.id,
        },
        create: {
          apiId: season.id,
          startDate: season.startDate ? new Date(season.startDate) : null,
          endDate: season.endDate ? new Date(season.endDate) : null,
          currentMatchday: season.currentMatchday,
          competitionId: dbCompetition.id,
        },
      });
    }
  }

  console.log("✅ Competitions and seasons imported.");
}

importCompetitions().catch((err) => {
  console.error("❌ Failed to import competitions:", err);
});