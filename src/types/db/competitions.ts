// Database types for Competitions table

import type { BaseTable, TableType } from './common';

// Competitions table row structure
export interface CompetitionRow extends BaseTable {
  name: string;
  type: string; // "League" | "Cup"
  country_id: number | null;
  logo_url: string | null;
  seasons: any; // JSONB array of season objects
  api_id: number | null; // API-Football.com league ID
  visible: boolean; // Whether this competition is visible in the app
}

// Season type for the JSONB seasons field
export interface Season {
  year: number;
  start: string; // ISO date string
  end: string; // ISO date string
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

// Competitions table type definition
export interface CompetitionTable extends TableType<CompetitionRow> {
  Row: CompetitionRow;
  Insert: {
    id?: number;
    name: string;
    type: string;
    country_id?: number | null;
    logo_url?: string | null;
    seasons?: any;
    api_id?: number | null;
    visible?: boolean;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: number;
    name?: string;
    type?: string;
    country_id?: number | null;
    logo_url?: string | null;
    seasons?: any;
    api_id?: number | null;
    visible?: boolean;
    created_at?: string;
    updated_at?: string;
  };
}