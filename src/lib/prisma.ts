import { Competition, Country, Match, PrismaClient, Team, Venue } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    adapter
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Export Prisma types for use throughout the application
export type { 
  User,
  Country,
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

export type VenueWithDetails = Venue & {
  teams: TeamWithCountry[];
  country: Country | null;
}

export type CompetitionWithCountry = Competition & {
  country: Country | null;
};

export default prisma;