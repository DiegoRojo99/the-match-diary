import { prisma } from '@/lib/prisma';

export type VenueUpsertInput = {
  id?: number;
  name?: string | null;
  city?: string | null;
  imageUrl?: string | null;
};

export async function upsertVenue(venue: VenueUpsertInput) {
  if (!venue.id) return null;
  const venueName = venue.name?.trim() || 'Unknown Venue';
  const venueCity = venue.city ?? null;
  const imageUrl = venue.imageUrl ?? null;

  return prisma.venue.upsert({
    where: { id: venue.id },
    update: {
      name: venueName,
      ...(venueCity ? { city: venueCity } : {}),
      ...(imageUrl ? { imageUrl } : {}),
      updatedAt: new Date(),
    },
    create: {
      id: venue.id,
      name: venueName,
      city: venueCity,
      imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function getVenueById(venueId: number) {
  return prisma.venue.findUnique({
    where: { id: venueId },
    include: {
      teams: true,
      matches: true,
    },
  });
}
