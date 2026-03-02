// Database types for Teams table

import type { BaseTable, TableType } from './common';

// Teams table row structure
export interface TeamRow extends BaseTable {
  name: string;
  team_code: string | null; // e.g., "MUN", "BAR"
  country_id: number | null;
  founded_year: number | null;
  national: boolean;
  logo_url: string | null;
  home_venue_id: number | null; // Reference to team's home venue
  api_id: number | null; // API-Football.com team ID
}

// Teams table type definition
export interface TeamTable extends TableType<TeamRow> {
  Row: TeamRow;
  Insert: {
    id?: number;
    name: string;
    team_code?: string | null;
    country_id?: number | null;
    founded_year?: number | null;
    national?: boolean;
    logo_url?: string | null;
    home_venue_id?: number | null;
    api_id?: number | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: number;
    name?: string;
    team_code?: string | null;
    country_id?: number | null;
    founded_year?: number | null;
    national?: boolean;
    logo_url?: string | null;
    home_venue_id?: number | null;
    api_id?: number | null;
    created_at?: string;
    updated_at?: string;
  };
}