import { PrismaClient } from '@prisma/generated/client';
const prisma = new PrismaClient();

async function geocodeAddress(address: string) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    address
  )}&format=json&limit=1`;

  const response = await fetch(url, {
    headers: { 'User-Agent': 'the-match-diary/1.0 (diego99rojo@gmail.com)' },
  });

  const data = await response.json();

  if (data && data.length > 0) {
    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
    };
  }

  return null;
}

async function updateTeamCoordinates() {
  const teams = await prisma.team.findMany({
    where: {
      address: { notIn: ['', 'null null null'] },
      latitude: null,
      longitude: null,
    },
    orderBy: { apiId: 'asc' },
    skip: 400,
    take: 50,
  });

  console.log(`Found ${teams.length} teams to geocode.`);

  for (const team of teams) {
    console.log(`Geocoding team: ${team.name}`);    
    const coords = await geocodeAddress(team.address!);

    if (coords) {
      await prisma.team.update({
        where: { id: team.id },
        data: {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
      });
      console.log(`Updated ${team.name}: ${coords.latitude}, ${coords.longitude}`);
    } else {
      console.warn(`Could not find coordinates for: ${team.name}`);
    }

    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log('Done!');
  await prisma.$disconnect();
}

updateTeamCoordinates().catch((err) => {
  console.error(err);
  prisma.$disconnect();
});
