// Team-related API types

import type { ApiResponse, BaseParams } from './common';
import type { ApiVenue } from './venues';

// Team data from API-Football.com
export interface ApiTeam {
  id: number;
  name: string;
  code: string; // Team code like "MUN", "BAR"
  country: string;
  founded: number;
  national: boolean;
  logo: string; // Team logo URL
}

// Team response includes both team and venue info
export interface ApiTeamResponse {
  team: ApiTeam;
  venue: ApiVenue;
}

// Request parameters for teams endpoint
export interface TeamsParams extends BaseParams {
  league?: number;
  season?: number;
  country?: string;
  code?: string;
  venue?: number;
}

// Teams API response type
export type ApiTeamsResponse = ApiResponse<ApiTeamResponse>;