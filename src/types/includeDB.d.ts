import { Stadium, Competition, Match, MatchVisit, Team } from "@prisma/generated/client";

type TeamWithDetails = Team & {
  stadium: Stadium | null;
};

type MatchVisitWithDetails = MatchVisit & {
  match: Match & {
    homeTeam: TeamWithDetails;
    awayTeam: Team;
    competition: Competition;
    stadium: Stadium | null;
  };
};

export type { MatchVisitWithDetails };