// Database types index - Re-export all database-related types

// Common types
export * from './common';

// Entity types
export * from './countries';
export * from './venues';
export * from './teams';
export * from './competitions';
export * from './matches';
export * from './users';

// Main Supabase Database type combining all tables
import type { CountryTable } from './countries';
import type { VenueTable } from './venues';
import type { TeamTable } from './teams';
import type { CompetitionTable } from './competitions';
import type { MatchTable } from './matches';
import type { UserTable, UserMatchTable, UserVenueTable } from './users';

// There's a cities table in the schema but we're keeping it simple for now
interface CityTable {
  Row: {
    id: number;
    name: string;
    country_id: number | null;
    latitude: number | null;
    longitude: number | null;
    timezone: string | null;
  };
  Insert: {
    id?: number;
    name: string;
    country_id?: number | null;
    latitude?: number | null;
    longitude?: number | null;
    timezone?: string | null;
  };
  Update: {
    id?: number;
    name?: string;
    country_id?: number | null;
    latitude?: number | null;
    longitude?: number | null;
    timezone?: string | null;
  };
}

export interface Database {
  public: {
    Tables: {
      users: UserTable;
      countries: CountryTable;
      cities: CityTable;
      venues: VenueTable;
      teams: TeamTable;
      competitions: CompetitionTable;
      matches: MatchTable;
      user_matches: UserMatchTable;
      user_venues: UserVenueTable;
    };
  };
}