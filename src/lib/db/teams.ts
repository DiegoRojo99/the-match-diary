import { prisma } from '@/lib/prisma';

export type TeamUpsertInput = {
  id?: number;
  name?: string | null;
  logo?: string | null;
  countryId?: number | null;
  teamCode?: string | null;
  homeVenueId?: number | null;
};

export async function upsertTeam(team: TeamUpsertInput) {
  if (!team.id || !team.name) return null;
  const teamName = team.name.trim() || 'Unknown Team';
  const teamLogo = team.logo ?? null;

  return prisma.team.upsert({
    where: { id: team.id },
    update: {
      name: teamName,
      ...(team.countryId !== undefined ? { countryId: team.countryId } : {}),
      ...(team.teamCode ? { teamCode: team.teamCode } : {}),
      ...(team.homeVenueId !== undefined ? { homeVenueId: team.homeVenueId } : {}),
      ...(teamLogo ? { logoUrl: teamLogo } : {}),
      updatedAt: new Date(),
    },
    create: {
      id: team.id,
      name: teamName,
      logoUrl: teamLogo,
      countryId: team.countryId ?? null,
      teamCode: team.teamCode ?? null,
      homeVenueId: team.homeVenueId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function getTeamById(teamId: number) {
  return prisma.team.findUnique({
    where: { id: teamId },
    include: {
      country: true,
      homeVenue: true,
    },
  });
}
