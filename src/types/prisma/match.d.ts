import { Competition, Match, Team, UserMatch, Venue } from "@prisma/client";

export type UserMatchWithMatch = UserMatch & {
  match: MatchWithDetails | null;
};

export type MatchWithDetails = Match & {
  homeTeam: Team | null;
  awayTeam: Team | null;
  competition: Competition | null;
  venue: (Venue & { city: { name: string } | null }) | null;
};

// Serialized versions for API responses (dates as strings)
export type UserMatchSerialized = Omit<UserMatch, 'attendedDate' | 'createdAt' | 'updatedAt'> & {
  attendedDate: string;
  createdAt: string;
  updatedAt: string;
};

export type MatchWithDetailsSerialized = Omit<Match, 'matchDate' | 'createdAt' | 'updatedAt'> & {
  matchDate: string;
  createdAt: string;
  updatedAt: string;
  homeTeam: Team | null;
  awayTeam: Team | null;
  competition: Competition | null;
  venue: (Venue & { city: { name: string } | null }) | null;
};

export type UserMatchWithMatchSerialized = UserMatchSerialized & {
  match: MatchWithDetailsSerialized | null;
};

// Combined match and user visit response type for API responses
export interface CombinedMatchResponse {
  match: MatchWithDetailsSerialized;
  userVisit: UserMatchSerialized | null;
}