import { prisma } from '@/lib/prisma';

export type CompetitionUpsertInput = {
  id?: number;
  name?: string | null;
  logo?: string | null;
  type?: string | null;
  visible?: boolean;
  countryId?: number | null;
};

export async function upsertCompetition(competition: CompetitionUpsertInput) {
  if (!competition.id) return null;
  const competitionName = competition.name?.trim() || 'Unknown Competition';
  const logoUrl = competition.logo ?? null;

  return prisma.competition.upsert({
    where: { id: competition.id },
    update: {
      name: competitionName,
      ...(competition.type ? { type: competition.type } : {}),
      ...(competition.countryId !== undefined ? { countryId: competition.countryId } : {}),
      ...(logoUrl ? { logoUrl } : {}),
      ...(competition.visible !== undefined ? { visible: competition.visible } : {}),
      updatedAt: new Date(),
    },
    create: {
      id: competition.id,
      name: competitionName,
      type: competition.type ?? 'league',
      countryId: competition.countryId ?? null,
      logoUrl,
      visible: competition.visible ?? false,
      seeded: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function getCompetitionById(competitionId: number) {
  return prisma.competition.findUnique({
    where: { id: competitionId },
    include: { country: true },
  });
}

export async function findVisibleCompetitions(limit = 8) {
  return prisma.competition.findMany({
    where: { visible: true },
    include: { country: true },
    orderBy: { name: 'asc' },
    take: limit,
  });
}
