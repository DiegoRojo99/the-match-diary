# The Match Diary - Database Schema Design

## Overview
This document outlines the database schema for The Match Diary web application, designed to track users' live football experiences including matches attended, stadiums visited, and competitions followed.

## Core Entities

### 1. Users
Stores user account information and preferences.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  preferences JSONB DEFAULT '{}' -- For storing user preferences like favorite teams, etc.
);
```

### 2. Countries
Reference table for country data.

```sql
CREATE TABLE countries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code_alpha2 CHAR(2) UNIQUE NOT NULL, -- ISO 3166-1 alpha-2
  code_alpha3 CHAR(3) UNIQUE NOT NULL, -- ISO 3166-1 alpha-3
  flag_url TEXT
);
```

### 3. Cities
Cities where stadiums are located.

```sql
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  country_id INTEGER REFERENCES countries(id),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  timezone VARCHAR(50)
);
```

### 4. Stadiums
Football stadiums and venues.

```sql
CREATE TABLE stadiums (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  city_id INTEGER REFERENCES cities(id),
  capacity INTEGER,
  opened_year INTEGER,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  address TEXT,
  api_football_id INTEGER, -- For API-Football.com integration
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Teams
Football teams/clubs.

```sql
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  short_name VARCHAR(20),
  country_id INTEGER REFERENCES countries(id),
  founded_year INTEGER,
  logo_url TEXT,
  primary_color VARCHAR(7), -- Hex color
  secondary_color VARCHAR(7), -- Hex color
  api_football_id INTEGER, -- For API-Football.com integration
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 6. Competitions
Leagues, cups, and tournaments.

```sql
CREATE TABLE competitions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  short_name VARCHAR(20),
  type VARCHAR(20) NOT NULL, -- 'league', 'cup', 'international'
  country_id INTEGER REFERENCES countries(id), -- NULL for international competitions
  season_start_month INTEGER, -- 1-12, when season typically starts
  logo_url TEXT,
  api_football_id INTEGER, -- For API-Football.com integration
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 7. Competition Seasons
Specific seasons of competitions.

```sql
CREATE TABLE competition_seasons (
  id SERIAL PRIMARY KEY,
  competition_id INTEGER REFERENCES competitions(id),
  year INTEGER NOT NULL, -- e.g., 2024 for 2024-25 season
  start_date DATE,
  end_date DATE,
  api_football_id INTEGER, -- For API-Football.com integration
  UNIQUE(competition_id, year)
);
```

### 8. Matches
Football matches.

```sql
CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  home_team_id INTEGER REFERENCES teams(id),
  away_team_id INTEGER REFERENCES teams(id),
  stadium_id INTEGER REFERENCES stadiums(id),
  competition_season_id INTEGER REFERENCES competition_seasons(id),
  match_date TIMESTAMP NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'finished', 'postponed', 'cancelled'
  attendance INTEGER,
  match_week INTEGER, -- Round/gameweek number
  api_football_id INTEGER, -- For API-Football.com integration
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 9. User Matches (Core Tracking Table)
Links users to matches they attended.

```sql
CREATE TABLE user_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  match_id INTEGER REFERENCES matches(id),
  attended_date TIMESTAMP DEFAULT NOW(), -- When they logged this attendance
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- User's rating of the experience
  notes TEXT, -- Personal notes about the match
  photos JSONB DEFAULT '[]', -- Array of photo URLs
  seat_section VARCHAR(50), -- Where they sat
  ticket_price DECIMAL(10,2),
  currency CHAR(3) DEFAULT 'EUR',
  weather VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, match_id) -- User can only log attending a match once
);
```

### 10. User Stadiums (Aggregate View)
Materialized view or table tracking stadium visits.

```sql
CREATE TABLE user_stadiums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stadium_id INTEGER REFERENCES stadiums(id),
  first_visit_date TIMESTAMP,
  last_visit_date TIMESTAMP,
  total_matches INTEGER DEFAULT 0,
  favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, stadium_id)
);
```

## Indexes for Performance

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Matches
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_teams ON matches(home_team_id, away_team_id);
CREATE INDEX idx_matches_stadium ON matches(stadium_id);
CREATE INDEX idx_matches_competition ON matches(competition_season_id);
CREATE INDEX idx_matches_api_id ON matches(api_football_id);

-- User Matches (most important for queries)
CREATE INDEX idx_user_matches_user ON user_matches(user_id);
CREATE INDEX idx_user_matches_match ON user_matches(match_id);
CREATE INDEX idx_user_matches_date ON user_matches(attended_date);
CREATE INDEX idx_user_matches_rating ON user_matches(rating);

-- Stadiums
CREATE INDEX idx_stadiums_city ON stadiums(city_id);
CREATE INDEX idx_stadiums_api_id ON stadiums(api_football_id);

-- Teams
CREATE INDEX idx_teams_country ON teams(country_id);
CREATE INDEX idx_teams_api_id ON teams(api_football_id);

-- Geographic indexes for map queries
CREATE INDEX idx_stadiums_location ON stadiums USING GIST (ST_Point(longitude, latitude));
```

## Key Relationships

1. **Users → User_Matches → Matches**: Core tracking relationship
2. **Matches → Stadium**: Every match has a venue
3. **Matches → Teams**: Home and away teams
4. **Matches → Competition_Seasons**: What competition the match was part of
5. **Stadium → Cities → Countries**: Geographic hierarchy
6. **User_Stadiums**: Aggregated view of stadium visits per user

## API Integration Notes

- `api_football_id` fields in major tables enable integration with API-Football.com
- This allows fetching live data while maintaining local user tracking
- Local IDs remain primary to ensure data consistency

## Scalability Considerations

- UUIDs for user-data tables to support distributed architecture
- JSONB fields for flexible data (preferences, photos)
- Prepared for future features like social sharing, match predictions, etc.
- Efficient indexing for common query patterns

## Future Extensions

1. **Social Features**: Friend connections, shared experiences
2. **Multi-Sport**: Additional sport types and rules
3. **Analytics**: Advanced statistics and insights
4. **Gamification**: Badges, achievements, challenges
5. **Travel Integration**: Flight/hotel booking for away matches