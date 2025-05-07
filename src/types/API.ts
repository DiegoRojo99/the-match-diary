type MatchAPI = {
  "area": {
      "id": number,
      "name": string,
      "code": string,
      "flag": string
  },
  "competition": {
      "id": number,
      "name": string,
      "code": string,
      "type": string,
      "emblem": string
  },
  "season": {
      "id": number,
      "startDate": string,
      "endDate": string,
      "currentMatchday": number,
      "winner": null | string
  },
  "id": number,
  "utcDate": string,
  "status": string,
  "matchday": number,
  "stage": string,
  "group": string,
  "lastUpdated": string,
  "homeTeam": {
      "id": number,
      "name": string,
      "shortName": string,
      "tla": string,
      "crest": string
  },
  "awayTeam": {
      "id": number,
      "name": string,
      "shortName": string,
      "tla": string,
      "crest": string
  },
  "score": {
      "winner": string,
      "duration": string,
      "fullTime": {
          "home": number | null,
          "away": number | null
      },
      "halfTime": { 
          "home": number | null,
          "away": number | null
      }
  },
};

export type { MatchAPI };