type MatchTeamAPI = {
  id: number,
  name: string,
  shortName: string,
  tla: string,
  crest: string
};

type MatchScoreAPI = {
  winner: string,
  duration: string,
  fullTime: {
    home: number | null,
    away: number | null
  },
  halfTime: {
    home: number | null,
    away: number | null
  }
};

type MatchCompetitionAPI = {
    id: number,
    name: string,
    code: string,
    type: string,
    emblem: string
};

type MatchAreaAPI = {
    id: number,
    name: string,
    code: string,
    flag: string
};

type MatchSeasonAPI = {
    id: number,
    startDate: string,
    endDate: string,
    currentMatchday: number,
    winner: null | string
};

type MatchAPI = {
  "area": MatchAreaAPI,
  "competition": MatchCompetitionAPI,
  "season": MatchSeasonAPI,
  "id": number,
  "utcDate": string,
  "status": string,
  "matchday": number,
  "stage": string,
  "group": string,
  "lastUpdated": string,
  "homeTeam": MatchTeamAPI,
  "awayTeam": MatchTeamAPI,
  "score": MatchScoreAPI,
};

export type { 
    MatchAPI, 
    MatchTeamAPI, 
    MatchScoreAPI, 
    MatchCompetitionAPI, 
    MatchAreaAPI, 
    MatchSeasonAPI
 };