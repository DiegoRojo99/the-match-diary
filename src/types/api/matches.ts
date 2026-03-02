// Match/Fixture-related API types

import type { ApiResponse, BaseParams } from './common';

// Match/Fixture status from API
export interface ApiFixtureStatus {
  short: string; // "FT", "NS", "1H", "HT", "2H"
  long: string; // "Match Finished", "Not Started", etc.
}

// Match/Fixture goals from API
export interface ApiGoals {
  home: number | null;
  away: number | null;
}

// Match/Fixture score periods from API
export interface ApiScore {
  halftime: ApiGoals;
  fulltime: ApiGoals;
  extratime?: ApiGoals;
  penalty?: ApiGoals;
}

// Basic team info in fixture response
export interface ApiFixtureTeam {
  id: number;
  name: string;
  logo: string;
}

// Teams object in fixture response
export interface ApiFixtureTeams {
  home: ApiFixtureTeam;
  away: ApiFixtureTeam;
}

// Basic venue info in fixture response
export interface ApiFixtureVenue {
  id: number;
  name: string;
  city: string;
}

// League info in fixture response
export interface ApiFixtureLeague {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
  season: number;
  round: string;
}

// Main fixture object from API
export interface ApiFixture {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string; // ISO date string
    timestamp: number;
    periods: {
      first: number | null;
      second: number | null;
    };
    venue: ApiFixtureVenue;
    status: ApiFixtureStatus;
  };
  league: ApiFixtureLeague;
  teams: ApiFixtureTeams;
  goals: ApiGoals;
  score: ApiScore;
}

// Request parameters for fixtures endpoint
export interface FixturesParams extends BaseParams {
  live?: string;
  date?: string; // YYYY-MM-DD
  league?: number;
  season?: number;
  team?: number;
  last?: number;
  next?: number;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  round?: string;
  status?: string;
  venue?: number;
  timezone?: string;
}

// Fixtures API response type
export type ApiFixturesResponse = ApiResponse<ApiFixture>;