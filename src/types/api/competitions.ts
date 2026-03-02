// Competition/League-related API types

import type { ApiResponse, BaseParams } from './common';
import type { ApiCountry } from './countries';

// League/Competition data from API-Football.com
export interface ApiLeague {
  id: number;
  name: string;
  type: string; // "League" | "Cup"
  logo: string; // League logo URL
}

// Season data from API (nested in league response)
export interface ApiSeason {
  year: number;
  start: string; // Date string
  end: string; // Date string
  current: boolean;
  coverage: {
    fixtures: {
      events: boolean;
      lineups: boolean;
      statistics_fixtures: boolean;
      statistics_players: boolean;
    };
    standings: boolean;
    players: boolean;
    top_scorers: boolean;
    top_assists: boolean;
    top_cards: boolean;
    injuries: boolean;
    predictions: boolean;
    odds: boolean;
  };
}

// Competition response includes league, country, and seasons
export interface ApiCompetition {
  league: ApiLeague;
  country: ApiCountry;
  seasons: ApiSeason[];
}

// Request parameters for leagues endpoint
export interface LeaguesParams extends BaseParams {
  country?: string;
  code?: string;
  season?: number;
  team?: number;
  type?: string;
  current?: boolean;
}

// Leagues API response type
export type ApiLeaguesResponse = ApiResponse<ApiCompetition>;