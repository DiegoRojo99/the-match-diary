type CompetitionsListItemAPI = {
  "id": number,
  "area": {
      "id": number,
      "name": string,
      "code": string | null,
      "flag": string | null
  },
  "name": string,
  "code": string | null,
  "type": string,
  "emblem": string | null,
  "plan": "TIER_ONE" | "TIER_TWO" | "TIER_THREE" | "TIER_FOUR" | null,
  "currentSeason": null | {
      "id": number,
      "startDate": string | null,
      "endDate": string | null,
      "currentMatchday": number | null,
      "winner": null | any
  },
  "numberOfAvailableSeasons": number,
  "lastUpdated": string
}

export type {
  CompetitionsListItemAPI
}