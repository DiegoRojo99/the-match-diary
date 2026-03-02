// Venue/Stadium-related API types

import type { ApiResponse, BaseParams } from './common';

// Venue data from API-Football.com
export interface ApiVenue {
  id: number;
  name: string;
  address: string;
  city: string;
  capacity: number;
  surface: string; // "grass" | "artificial"
  image: string; // Venue image URL
}

// Request parameters for venues endpoint
export interface VenuesParams extends BaseParams {
  city?: string;
  country?: string;
}

// Venues API response type
export type ApiVenuesResponse = ApiResponse<ApiVenue>;