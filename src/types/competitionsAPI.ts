type CompetitionsListItemAPI = {
  "id": number,
  "area": {
      "id": number,
      "name": string,
      "code": string,
      "flag": string
  },
  "name": string,
  "code": string,
  "type": string,
  "emblem": string,
  "plan": "TIER_ONE" | "TIER_TWO" | "TIER_THREE" | "TIER_FOUR",
  "currentSeason": {
      "id": number,
      "startDate": string,
      "endDate": string,
      "currentMatchday": number,
      "winner": null | string
  },
  "numberOfAvailableSeasons": number,
  "lastUpdated": string
}