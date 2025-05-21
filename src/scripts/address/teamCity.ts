import { PrismaClient, Team } from '@prisma/generated/client';
import { fallbackExtractCity } from './addressBreakdown';

const prisma = new PrismaClient();

async function updateTeamCities() {
  // Fetch all teams with a null city
  const teams: Team[] = await prisma.team.findMany({
    where: { 
      address: {
        notIn: ['null null null', 'Unknown Address', 'Unknown Stadium', ''],
        not: null,
      },
      city: null
    },
  });

  for (const team of teams) {
    // Check if the team has an address
    if (!team.address) {
      console.log(`No address found for team ${team.name}`);
      continue;
    }

    // Use fallbackExtractCity to get the city
    let city = fallbackExtractCity(team.address);
    if (!city) {
      console.log(`No city found for team ${team.name}`);
      continue;
    }

    city = city.replaceAll('null', '');
    // Update the team with the extracted city
    await prisma.team.update({
      where: { id: team.id },
      data: { city },
    });
    console.log(`Updated team ${team.name} with city: ${city}`);
    
  }
}

updateTeamCities()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });