export interface DiscoverFixtureApiTeam {
  id?: number;
  name?: string | null;
  logo?: string | null;
}

export interface DiscoverFixtureApiVenue {
  id?: number;
  name?: string | null;
  city?: string | null;
}

export interface DiscoverFixtureApiStatus {
  short?: string | null;
  long?: string | null;
}

export interface DiscoverFixtureApiLeague {
  id?: number;
  name?: string | null;
  logo?: string | null;
  country?: string | null;
  flag?: string | null;
}

export interface DiscoverFixtureApiFixture {
  id?: number;
  date?: string | null;
  status?: DiscoverFixtureApiStatus | null;
  venue?: DiscoverFixtureApiVenue | null;
}

export interface DiscoverFixtureApiResponse {
  fixture?: DiscoverFixtureApiFixture | null;
  league?: DiscoverFixtureApiLeague | null;
  teams?: {
    home?: DiscoverFixtureApiTeam | null;
    away?: DiscoverFixtureApiTeam | null;
  } | null;
  goals?: {
    home?: number | null;
    away?: number | null;
  } | null;
}

export interface DiscoverCompetitionSummary {
  id: number;
  name: string;
  type?: string | null;
  logoUrl?: string | null;
  country?: {
    name?: string | null;
    code?: string | null;
  } | null;
}

export interface DiscoverFixtureNormalized {
  id: number | null;
  date: string | null;
  status: {
    short: string | null;
    long: string | null;
  };
  homeTeam: {
    id: number | null;
    name: string | null;
    logoUrl: string | null;
  };
  awayTeam: {
    id: number | null;
    name: string | null;
    logoUrl: string | null;
  };
  venue: {
    id: number | null;
    name: string | null;
    city: string | null;
  } | null;
  competition: {
    id: number | null;
    name: string | null;
    logoUrl: string | null;
    country: string | null;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}
