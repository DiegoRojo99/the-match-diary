import { ApiCompetition, ApiFixture, ApiTeam, ApiTeamResponse, ApiTeamsResponse, ApiVenue } from '@/types';
import type { ApiCountry } from '@/types/api/countries';

const API_BASE_URL = 'https://v3.football.api-sports.io';

class ApiFootballService {
  private getApiKey(): string {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      throw new Error('RAPIDAPI_KEY environment variable is required');
    }
    return apiKey;
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log(`🌐 API Request: ${endpoint}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': this.getApiKey(),
        'X-RapidAPI-Host': 'v3.football.api-sports.io',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Log API quota usage
    const remaining = response.headers.get('x-ratelimit-requests-remaining');
    const quota = response.headers.get('x-ratelimit-requests-limit');
    
    if (remaining && quota) {
      console.log(`📊 API Quota: ${remaining}/${quota} remaining`);
    }

    if (!data.response) {
      throw new Error('Invalid API response format');
    }

    return data.response;
  }

  async getCountries(): Promise<ApiCountry[]> {
    return this.makeRequest<ApiCountry[]>('/countries');
  }

  async getLeagues(country?: string, season?: number): Promise<ApiCompetition[]> {
    let endpoint = '/leagues';
    const params = new URLSearchParams();
    
    if (country) params.append('country', country);
    if (season) params.append('season', season.toString());
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return this.makeRequest<ApiCompetition[]>(endpoint);
  }

  async getTeams(league?: number, season?: number, country?: string): Promise<ApiTeamResponse[]> {
    let endpoint = '/teams';
    const params = new URLSearchParams();
    
    if (league) params.append('league', league.toString());
    if (season) params.append('season', season.toString());
    if (country) params.append('country', country);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return this.makeRequest<ApiTeamResponse[]>(endpoint);
  }

  async getVenues(country?: string, city?: string): Promise<ApiVenue[]> {
    let endpoint = '/venues';
    const params = new URLSearchParams();
    
    if (country) params.append('country', country);
    if (city) params.append('city', city);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return this.makeRequest<ApiVenue[]>(endpoint);
  }

  async getFixtures(league?: number, season?: number, from?: string, to?: string): Promise<ApiFixture[]> {
    let endpoint = '/fixtures';
    const params = new URLSearchParams();
    
    if (league) params.append('league', league.toString());
    if (season) params.append('season', season.toString());
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return this.makeRequest<ApiFixture[]>(endpoint);
  }

  async getTeamFixtures(teamId: number, season?: number, last?: number, next?: number): Promise<ApiFixture[]> {
    let endpoint = '/fixtures';
    const params = new URLSearchParams();
    
    params.append('team', teamId.toString());
    if (season) params.append('season', season.toString());

    // If both last and next are provided, prioritize last
    if (last) params.append('last', last.toString());
    else if (next) params.append('next', next.toString());
    
    endpoint += `?${params.toString()}`;
    
    console.log('🏈 Full API URL being called:', `${API_BASE_URL}${endpoint}`);
    
    return this.makeRequest<ApiFixture[]>(endpoint);
  }
}

export const apiFootballService = new ApiFootballService();