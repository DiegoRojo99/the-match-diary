# API Integration Plan - API-Football.com

## Overview
This document outlines the integration strategy for API-Football.com to fetch live football data for The Match Diary application.

## API-Football.com Details
- **Base URL**: `https://api-football-v1.p.rapidapi.com/v3/`
- **Authentication**: RapidAPI Key (Header: `X-RapidAPI-Key`)
- **Rate Limits**: Depends on subscription plan (Free: 100 requests/day)
- **Response Format**: JSON

## Required Environment Variables

Create a `.env.local` file with:
```bash
RAPIDAPI_KEY=your_rapidapi_key_here
NEXT_PUBLIC_API_BASE_URL=https://api-football-v1.p.rapidapi.com/v3
```

## Key API Endpoints to Use

### 1. Countries
```
GET /countries
```
Purpose: Populate the countries reference table
Usage: Initial data seeding

### 2. Leagues/Competitions
```
GET /leagues?season=2024
GET /leagues?country={country_code}&season=2024
```
Purpose: Get competition data (Premier League, La Liga, etc.)
Usage: Populate competitions table

### 3. Teams
```
GET /teams?league={league_id}&season=2024
GET /teams?country={country_code}
```
Purpose: Get team information including logos, names, venues
Usage: Populate teams table

### 4. Venues/Stadiums
```
GET /venues?country={country_code}
GET /venues?city={city_name}
```
Purpose: Stadium data including capacity, location, images
Usage: Populate stadiums table

### 5. Fixtures/Matches
```
GET /fixtures?league={league_id}&season=2024
GET /fixtures?team={team_id}&season=2024
GET /fixtures?date={YYYY-MM-DD}
```
Purpose: Match data including results, dates, venues
Usage: Let users select matches they attended

### 6. Match Statistics
```
GET /fixtures/statistics?fixture={fixture_id}
```
Purpose: Detailed match statistics
Usage: Enrich user's match experience data

## API Integration Strategy

### Phase 1: Data Seeding
1. Fetch and store reference data (countries, leagues, teams, venues)
2. Create admin endpoints for data synchronization
3. Implement caching strategy for static data

### Phase 2: Live Match Data
1. Fetch current season fixtures for major leagues
2. Allow users to search and select matches
3. Update match results periodically

### Phase 3: Enhanced Features
1. Real-time match updates
2. Player statistics
3. Team standings and league tables

## Implementation Structure

### API Client Service
```typescript
// lib/api-football.ts
interface APIFootballOptions {
  rapidApiKey: string;
  baseUrl: string;
}

class APIFootballClient {
  private options: APIFootballOptions;
  
  constructor(options: APIFootballOptions) {
    this.options = options;
  }
  
  private async request(endpoint: string, params?: Record<string, string>) {
    const url = new URL(endpoint, this.options.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    const response = await fetch(url.toString(), {
      headers: {
        'X-RapidAPI-Key': this.options.rapidApiKey,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async getCountries() {
    return this.request('/countries');
  }
  
  async getLeagues(params?: { season?: number; country?: string }) {
    return this.request('/leagues', params);
  }
  
  async getTeams(params?: { league?: number; season?: number; country?: string }) {
    return this.request('/teams', params);
  }
  
  async getVenues(params?: { country?: string; city?: string }) {
    return this.request('/venues', params);
  }
  
  async getFixtures(params?: { 
    league?: number; 
    season?: number; 
    team?: number; 
    date?: string;
  }) {
    return this.request('/fixtures', params);
  }
}

export const apiFootball = new APIFootballClient({
  rapidApiKey: process.env.RAPIDAPI_KEY!,
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL!,
});
```

### API Routes (Next.js)

#### 1. Data Seeding Route
```typescript
// app/api/admin/seed/route.ts
import { apiFootball } from '@/lib/api-football';
import { db } from '@/lib/database'; // Your database client

export async function POST() {
  try {
    // Seed countries
    const countries = await apiFootball.getCountries();
    await db.countries.createMany(countries.response);
    
    // Seed major leagues
    const leagues = await apiFootball.getLeagues({ season: 2024 });
    await db.competitions.createMany(leagues.response);
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

#### 2. Search Matches Route
```typescript
// app/api/matches/search/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const league = searchParams.get('league');
  const date = searchParams.get('date');
  const team = searchParams.get('team');
  
  const matches = await apiFootball.getFixtures({
    league: league ? parseInt(league) : undefined,
    date,
    team: team ? parseInt(team) : undefined,
  });
  
  return Response.json(matches);
}
```

## Data Synchronization Strategy

### 1. Initial Setup
- Create admin dashboard for data seeding
- Populate reference tables (countries, leagues, teams, venues)
- Set up cron jobs for periodic updates

### 2. Match Data Updates
- Daily sync for current season fixtures
- Real-time updates for live matches (if needed)
- Historical data as needed

### 3. Caching Strategy
```typescript
// lib/cache.ts
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour default TTL

export const getCachedData = (key: string) => cache.get(key);
export const setCachedData = (key: string, data: any, ttl?: number) => 
  cache.set(key, data, ttl);

// Usage in API routes
const cacheKey = `fixtures_${league}_${season}`;
let fixtures = getCachedData(cacheKey);

if (!fixtures) {
  fixtures = await apiFootball.getFixtures({ league, season });
  setCachedData(cacheKey, fixtures, 24 * 60 * 60); // Cache for 24 hours
}
```

## Error Handling & Rate Limiting

### Rate Limiting Strategy
```typescript
// lib/rate-limiter.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 d'), // 100 requests per day
});

export const checkRateLimit = async (identifier: string) => {
  const { success } = await ratelimit.limit(identifier);
  return success;
};
```

### Error Handling
```typescript
// lib/api-error-handler.ts
export class APIError extends Error {
  code: string;
  statusCode: number;
  
  constructor(message: string, code: string, statusCode: number) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

export const handleAPIError = (error: unknown) => {
  if (error instanceof APIError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }
  
  return Response.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
};
```

## Security Considerations

1. **API Key Protection**: Store in environment variables, never expose in client-side code
2. **Rate Limiting**: Implement application-level rate limiting
3. **Data Validation**: Validate all API responses before database storage
4. **Caching**: Reduce API calls with intelligent caching
5. **Error Handling**: Graceful degradation when API is unavailable

## Testing Strategy

### 1. Mock API Responses
```typescript
// tests/mocks/api-football.ts
export const mockFixturesResponse = {
  response: [
    {
      fixture: { id: 1, date: '2024-03-02T15:00:00Z' },
      teams: { home: { name: 'Real Madrid' }, away: { name: 'Barcelona' } },
      venue: { name: 'Santiago Bernabéu' }
    }
  ]
};
```

### 2. Integration Tests
- Test API client functionality
- Test data synchronization
- Test caching mechanisms
- Test rate limiting

## Migration & Deployment

### Environment Setup
1. Configure RapidAPI account and get API key
2. Set up environment variables in deployment platform
3. Configure database for API data storage
4. Set up monitoring for API usage and errors

### Initial Data Population
1. Run initial seed script for reference data
2. Set up automated daily sync for match data
3. Configure backup strategies for API data

This integration plan provides a solid foundation for incorporating live football data while maintaining performance, reliability, and scalability.