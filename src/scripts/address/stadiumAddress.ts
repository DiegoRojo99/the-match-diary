import { PrismaClient } from '@prisma/client';
import { extractCityAndCountryFromAddress } from './addressBreakdown';

const prisma = new PrismaClient();

export async function updateStadiumAddresses() {
  const stadiums = await prisma.stadium.findMany({
    where: {
      address: {
        not: '',
      },
      country: null,
    },
  });
  console.log(`Found ${stadiums.length} stadiums to update.`);

  for (const stadium of stadiums) {
    if (!stadium.address) continue;

    const cityCountry = await extractCityAndCountryFromAddress(stadium.address);
    const city = cityCountry?.city ?? null;
    const country = cityCountry?.country ?? null;
    console.log(`Extracted city: ${city}`);
    console.log(`Extracted country: ${country}`);
    
    const updateData: { [key: string]: string } = {};
    if (city != null) updateData.city = city;
    if (country != null) updateData.country = country;

    await prisma.stadium.update({
      where: { id: stadium.id },
      data: updateData,
    }).catch((error) => {
      console.error(`Error updating stadium ${stadium.id}:`, error);
    });
  }
}

updateStadiumAddresses().then(() => console.log('Stadiums updated.'));