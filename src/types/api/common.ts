// Common API-Football.com response types and shared structures

// Base API Response structure
export interface ApiResponse<T> {
  get: string;
  parameters: Record<string, any>;
  errors: string[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: T[];
}

// API Error type
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// API Client options
export interface ApiFootballOptions {
  rapidApiKey: string;
  baseUrl: string;
}

// Common request parameters
export interface BaseParams {
  id?: number;
  name?: string;
  search?: string;
}