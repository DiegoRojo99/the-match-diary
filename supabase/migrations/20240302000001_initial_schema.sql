-- The Match Diary - Initial Database Schema
-- Aligned with API-Football.com structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for geographic queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  preferences JSONB DEFAULT '{}'
);

-- Countries table (aligned with API structure)
CREATE TABLE countries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL, -- e.g., "England"
  code CHAR(2) UNIQUE NOT NULL, -- API field: "GB" (ISO 3166-1 alpha-2)
  flag TEXT -- API field: flag URL from API-Football.com
);

-- Cities table
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  country_id INTEGER REFERENCES countries(id),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  timezone VARCHAR(50)
);

-- Venues table (aligned with API structure)
CREATE TABLE venues (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL, -- API field: name
  city_id INTEGER REFERENCES cities(id),
  capacity INTEGER, -- API field: capacity
  address TEXT, -- API field: address
  surface VARCHAR(20), -- API field: "grass" or "artificial"
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  api_id INTEGER UNIQUE, -- API field: venue.id
  image_url TEXT, -- API field: image
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Teams table (aligned with API structure)
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL, -- API field: name
  team_code VARCHAR(10), -- API field: code (e.g., "MUN")
  country_id INTEGER REFERENCES countries(id),
  founded_year INTEGER, -- API field: founded
  national BOOLEAN DEFAULT FALSE, -- API field: national
  logo_url TEXT, -- API field: logo
  home_venue_id INTEGER REFERENCES venues(id), -- Team's home stadium
  api_id INTEGER UNIQUE, -- API field: team.id
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Competitions table with embedded seasons (aligned with API structure)
CREATE TABLE competitions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL, -- API field: league.name
  type VARCHAR(20) NOT NULL, -- API field: league.type ('League', 'Cup')
  country_id INTEGER REFERENCES countries(id), -- From nested country object
  logo_url TEXT, -- API field: league.logo
  seasons JSONB DEFAULT '[]', -- API field: seasons array
  -- seasons structure: [{year, start, end, current, coverage}]
  api_id INTEGER UNIQUE, -- API field: league.id
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Matches table (aligned with API structure)
CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  home_team_id INTEGER REFERENCES teams(id),
  away_team_id INTEGER REFERENCES teams(id),
  venue_id INTEGER REFERENCES venues(id), -- Match venue (can differ from team home)
  competition_id INTEGER REFERENCES competitions(id),
  season_year INTEGER NOT NULL, -- e.g., 2024 for 2024-25 season
  match_date TIMESTAMP NOT NULL, -- API field: fixture.date
  home_score INTEGER, -- API field: goals.home
  away_score INTEGER, -- API field: goals.away
  status_short VARCHAR(10), -- API field: fixture.status.short
  status_long VARCHAR(50), -- API field: fixture.status.long
  match_week INTEGER, -- API field: league.round
  periods JSONB, -- API field: score object (halftime/fulltime)
  api_id INTEGER UNIQUE, -- API field: fixture.id
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User matches table (core tracking)
CREATE TABLE user_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  match_id INTEGER REFERENCES matches(id),
  attended_date TIMESTAMP DEFAULT NOW(),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  photos JSONB DEFAULT '[]', -- Array of photo URLs
  seat_section VARCHAR(50),
  ticket_price DECIMAL(10,2),
  currency CHAR(3) DEFAULT 'EUR',
  weather VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

-- User venues table (aggregate view)
CREATE TABLE user_venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  venue_id INTEGER REFERENCES venues(id),
  first_visit_date TIMESTAMP,
  last_visit_date TIMESTAMP,
  total_matches INTEGER DEFAULT 0,
  favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, venue_id)
);

-- Performance indexes
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Teams
CREATE INDEX idx_teams_api_id ON teams(api_id);
CREATE INDEX idx_teams_country ON teams(country_id);
CREATE INDEX idx_teams_code ON teams(team_code);

-- Competitions
CREATE INDEX idx_competitions_api_id ON competitions(api_id);
CREATE INDEX idx_competitions_country ON competitions(country_id);
CREATE INDEX idx_competitions_type ON competitions(type);

-- Venues
CREATE INDEX idx_venues_api_id ON venues(api_id);
CREATE INDEX idx_venues_city ON venues(city_id);

-- Matches (most important for queries)
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_teams ON matches(home_team_id, away_team_id);
CREATE INDEX idx_matches_venue ON matches(venue_id);
CREATE INDEX idx_matches_competition_season ON matches(competition_id, season_year);
CREATE INDEX idx_matches_api_id ON matches(api_id);
CREATE INDEX idx_matches_status ON matches(status_short);

-- User Matches (most important for user queries)
CREATE INDEX idx_user_matches_user ON user_matches(user_id);
CREATE INDEX idx_user_matches_match ON user_matches(match_id);
CREATE INDEX idx_user_matches_date ON user_matches(attended_date);
CREATE INDEX idx_user_matches_rating ON user_matches(rating);

-- User Venues (aggregated views)
CREATE INDEX idx_user_venues_user ON user_venues(user_id);
CREATE INDEX idx_user_venues_venue ON user_venues(venue_id);
CREATE INDEX idx_user_venues_first_visit ON user_venues(first_visit_date);

-- Geographic indexes for map queries
CREATE INDEX idx_venues_location ON venues USING GIST (ST_Point(longitude, latitude));

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_venues ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- User matches policies
CREATE POLICY "Users can view own matches" ON user_matches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own matches" ON user_matches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own matches" ON user_matches
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own matches" ON user_matches
  FOR DELETE USING (auth.uid() = user_id);

-- User venues policies
CREATE POLICY "Users can view own venues" ON user_venues
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own venues" ON user_venues
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own venues" ON user_venues
  FOR UPDATE USING (auth.uid() = user_id);

-- Reference data is public (read-only for authenticated users)
CREATE POLICY "Public read access to countries" ON countries
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Public read access to cities" ON cities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Public read access to venues" ON venues
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Public read access to teams" ON teams
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Public read access to competitions" ON competitions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Public read access to matches" ON matches
  FOR SELECT TO authenticated USING (true);

-- Functions for updating user_venues aggregates
CREATE OR REPLACE FUNCTION update_user_venues_on_match_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_venues (user_id, venue_id, first_visit_date, last_visit_date, total_matches)
  SELECT 
    NEW.user_id,
    m.venue_id,
    NEW.attended_date,
    NEW.attended_date,
    1
  FROM matches m 
  WHERE m.id = NEW.match_id
  ON CONFLICT (user_id, venue_id) 
  DO UPDATE SET
    last_visit_date = GREATEST(user_venues.last_visit_date, NEW.attended_date),
    first_visit_date = LEAST(user_venues.first_visit_date, NEW.attended_date),
    total_matches = user_venues.total_matches + 1,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_venues_on_match_insert
  AFTER INSERT ON user_matches
  FOR EACH ROW
  EXECUTE FUNCTION update_user_venues_on_match_insert();