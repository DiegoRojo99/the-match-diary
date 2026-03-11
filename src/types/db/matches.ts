import { Competition, Match, Team, Venue } from "@prisma/client";

export type MatchWithDetails = Match & {
  homeTeam: Team | null;
  awayTeam: Team | null;
  venue: Venue | null;
  competition: Competition | null;
};