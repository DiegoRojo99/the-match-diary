// Database types for Matches table

import type { BaseTable, TableType } from './common';

// Matches table row structure
export interface MatchRow extends BaseTable {
  home_team_id: number | null;
  away_team_id: number | null;
  venue_id: number | null;
  competition_id: number | null;
  season_year: number;
  match_date: string;
  home_score: number | null;
  away_score: number | null;
  status_short: string | null; // "FT", "NS", "1H", etc.
  status_long: string | null; // "Match Finished", "Not Started", etc.
  match_week: number | null;
  periods: any | null; // JSONB score periods
  api_id: number | null; // API-Football.com fixture ID
}

// Match periods type for the JSONB periods field
export interface MatchPeriods {
  first: number | null;
  second: number | null;
  extratime?: {
    first: number | null;
    second: number | null;
  };
  penalty?: {
    first: number | null;
    second: number | null;
  };
}

// Matches table type definition
export interface MatchTable extends TableType<MatchRow> {
  Row: MatchRow;
  Insert: {
    id?: number;
    home_team_id?: number | null;
    away_team_id?: number | null;
    venue_id?: number | null;
    competition_id?: number | null;
    season_year: number;
    match_date: string;
    home_score?: number | null;
    away_score?: number | null;
    status_short?: string | null;
    status_long?: string | null;
    match_week?: number | null;
    periods?: any | null;
    api_id?: number | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: number;
    home_team_id?: number | null;
    away_team_id?: number | null;
    venue_id?: number | null;
    competition_id?: number | null;
    season_year?: number;
    match_date?: string;
    home_score?: number | null;
    away_score?: number | null;
    status_short?: string | null;
    status_long?: string | null;
    match_week?: number | null;
    periods?: any | null;
    api_id?: number | null;
    created_at?: string;
    updated_at?: string;
  };
}