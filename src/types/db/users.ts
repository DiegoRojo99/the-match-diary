// Database types for User-related tables

import type { BaseTable, BaseUserTable, TableType } from './common';

// Users table row structure
export interface UserRow {
  id: string; // UUID
  email: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  preferences: any; // JSONB
}

// User matches table row structure
export interface UserMatchRow extends BaseUserTable {
  match_id: number;
  attended_date: string;
  rating: number | null; // 1-5 stars
  notes: string | null;
  photos: any; // JSONB array of photo URLs
  seat_section: string | null;
  ticket_price: number | null;
  currency: string;
  weather: string | null;
}

// User venues table row structure
export interface UserVenueRow extends BaseUserTable {
  venue_id: number;
  first_visit_date: string | null;
  last_visit_date: string | null;
  total_matches: number;
  favorite: boolean;
}

// Photo type for the JSONB photos field
export interface Photo {
  url: string;
  caption?: string;
  uploaded_at: string;
  size?: number; // in bytes
  width?: number; // in pixels
  height?: number; // in pixels
  thumbnail_url?: string; // Optional thumbnail version
}

// User preferences type for JSONB preferences field
export interface UserPreferences {
  favorite_teams?: number[]; // Array of team IDs
  favorite_competitions?: number[]; // Array of competition IDs
  home_country?: number; // Country ID
  currency?: string; // Preferred currency
  timezone?: string; // User timezone
  notifications?: {
    match_reminders?: boolean;
    team_news?: boolean;
    venue_updates?: boolean;
  };
  privacy?: {
    profile_public?: boolean;
    matches_public?: boolean;
    venues_public?: boolean;
  };
}

// Users table type definition
export interface UserTable extends TableType<UserRow> {
  Row: UserRow;
  Insert: {
    id?: string;
    email: string;
    username?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
    created_at?: string;
    updated_at?: string;
    preferences?: any;
  };
  Update: {
    id?: string;
    email?: string;
    username?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
    created_at?: string;
    updated_at?: string;
    preferences?: any;
  };
}

// User matches table type definition
export interface UserMatchTable extends TableType<UserMatchRow> {
  Row: UserMatchRow;
  Insert: {
    id?: string;
    user_id: string;
    match_id: number;
    attended_date?: string;
    rating?: number | null;
    notes?: string | null;
    photos?: any;
    seat_section?: string | null;
    ticket_price?: number | null;
    currency?: string;
    weather?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    match_id?: number;
    attended_date?: string;
    rating?: number | null;
    notes?: string | null;
    photos?: any;
    seat_section?: string | null;
    ticket_price?: number | null;
    currency?: string;
    weather?: string | null;
    created_at?: string;
    updated_at?: string;
  };
}

// User venues table type definition
export interface UserVenueTable extends TableType<UserVenueRow> {
  Row: UserVenueRow;
  Insert: {
    id?: string;
    user_id: string;
    venue_id: number;
    first_visit_date?: string | null;
    last_visit_date?: string | null;
    total_matches?: number;
    favorite?: boolean;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    venue_id?: number;
    first_visit_date?: string | null;
    last_visit_date?: string | null;
    total_matches?: number;
    favorite?: boolean;
    created_at?: string;
    updated_at?: string;
  };
}