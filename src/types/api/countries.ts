// Country-related API types

import type { ApiResponse, BaseParams } from './common';

// Country data from API-Football.com
export interface ApiCountry {
  name: string;
  code: string; // 2-letter country code (e.g., "GB", "ES")
  flag: string; // Flag image URL
}

// Request parameters for countries endpoint
export interface CountriesParams extends BaseParams {
  code?: string;
}

// Countries API response type
export type ApiCountriesResponse = ApiResponse<ApiCountry>;