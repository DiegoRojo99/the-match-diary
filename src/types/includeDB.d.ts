import { Stadium, Competition, Match, MatchVisit, Team } from "@prisma/generated/client";

type MatchVisitWithDetails = MatchVisit & {
  match: Match & {
    homeTeam: Team;
    awayTeam: Team;
    competition: Competition;
    stadium: Stadium | null;
  };
};

export type { MatchVisitWithDetails };