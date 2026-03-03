import type { BaseTable, TableType } from './common';
import { CountryRow } from './countries';
import { TeamWithCountry } from './teams';

// Venues table row structure
export interface VenueRow extends BaseTable {
  name: string;
  city_id: number | null;
  capacity: number | null;
  address: string | null;
  surface: string | null; // "grass" | "artificial"
  latitude: number | null;
  longitude: number | null;
  api_id: number | null; // API-Football.com venue ID
  image_url: string | null;
}

// Venues table type definition
export interface VenueTable extends TableType<VenueRow> {
  Row: VenueRow;
  Insert: {
    id?: number;
    name: string;
    city_id?: number | null;
    capacity?: number | null;
    address?: string | null;
    surface?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    api_id?: number | null;
    image_url?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: number;
    name?: string;
    city_id?: number | null;
    capacity?: number | null;
    address?: string | null;
    surface?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    api_id?: number | null;
    image_url?: string | null;
    created_at?: string;
    updated_at?: string;
  };
}

export interface VenueWithDetails extends VenueRow {
  teams: TeamWithCountry[];
  country: CountryRow | null;
}