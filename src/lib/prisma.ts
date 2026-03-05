import { City, Competition, Country, Match, PrismaClient, Team, Venue } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Export Prisma types for use throughout the application
export type { 
  User,
  Country,
  City,
  Venue,
  Team,
  Competition,
  Match,
  UserMatch,
  UserVenue,
} from '@prisma/client';

// Export some useful complex types
export type TeamWithCountry = Team & {
  country: Country | null;
};

export type TeamWithVenue = Team & {
  homeVenue: Venue | null;
};

export type TeamWithCountryAndVenue = Team & {
  country: Country | null;
  homeVenue: Venue | null;
};

export type MatchWithTeamsAndVenue = Match & {
  homeTeam: Team | null;
  awayTeam: Team | null;
  venue: Venue | null;
  competition: Competition | null;
};

export type VenueWithCity = Venue & {
  city: (City & {
    country: Country | null;
  }) | null;
};

export default prisma;