import { Competition, Match, Team, Venue } from "@prisma/client";

type MatchWithDetails = Match & {
  homeTeam: Team | null;
  awayTeam: Team | null;
  competition: Competition | null;
  venue: Venue | null;
};