import { Competition, Match, Team, UserMatch, Venue } from "@prisma/client";

export type UserMatchWithMatch = UserMatch & {
  match: MatchWithDetails | null;
};

export type MatchWithDetails = Match & {
  homeTeam: Team | null;
  awayTeam: Team | null;
  competition: Competition | null;
  venue: Venue | null;
};

// Combined match and user visit response type
export interface CombinedMatchResponse {
  match: MatchWithDetails;
  userVisit: UserMatch | null;
}