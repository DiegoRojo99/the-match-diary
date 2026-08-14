import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiFootballService } from '@/lib/api-football';
import {
  findDiscoverFixturesByDate,
  saveApiFixtureToDatabase,
} from '@/lib/db';
import {
  createDiscoverCompetitionSummaries,
  normalizeDbFixture,
  normalizeFixture,
  sortDiscoverFixtures,
} from '@/types/dto/discover';

import type {
  DiscoverCompetitionSummary,
  DiscoverFixtureNormalized,
} from '@/types';

const DISCOVER_FIXTURE_CACHE_TTL_MS = 60 * 60 * 1000;
const discoverFixtureCache = new Map<
  string,
  { expiresAt: number; value: { competitions: DiscoverCompetitionSummary[]; fixtures: DiscoverFixtureNormalized[] } }
>();
const discoverFixtureRequests = new Map<string, Promise<{ competitions: DiscoverCompetitionSummary[]; fixtures: DiscoverFixtureNormalized[] }>>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const competitionIdParam = searchParams.get('competitionId');
    const limitParam = searchParams.get('limit');
    const from = searchParams.get('from') ?? new Date().toISOString().slice(0, 10);
    const to =
      searchParams.get('to') ??
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString().slice(0, 10);

    const limit = Number(limitParam ?? 12);
    const season = new Date().getFullYear();
    const competitionId = competitionIdParam ? Number(competitionIdParam) : null;
    const cacheKey = JSON.stringify({ competitionId, season, from, to, limit });

    const cached = discoverFixtureCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.value);
    }

    if (discoverFixtureRequests.has(cacheKey)) {
      return NextResponse.json(await discoverFixtureRequests.get(cacheKey)!);
    }

    const requestPromise = (async () => {
      const competitions = competitionId
        ? await prisma.competition.findMany({
            where: { id: competitionId, visible: true },
            include: { country: true },
            orderBy: { name: 'asc' },
          })
        : await prisma.competition.findMany({
            where: { visible: true },
            include: { country: true },
            orderBy: { name: 'asc' },
            take: 8,
          });

      const competitionSummaries = createDiscoverCompetitionSummaries(competitions);

      if (!competitions.length) {
        const emptyResponse = { competitions: [], fixtures: [] };
        discoverFixtureCache.set(cacheKey, {
          expiresAt: Date.now() + DISCOVER_FIXTURE_CACHE_TTL_MS,
          value: emptyResponse,
        });
        return emptyResponse;
      }

      const dbMatches = await findDiscoverFixturesByDate({
        season,
        competitionId,
        from,
        to,
        limit,
      });

      if (dbMatches.length > 0) {
        const response = {
          competitions: competitionSummaries,
          fixtures: dbMatches.map(normalizeDbFixture).slice(0, limit),
        };
        discoverFixtureCache.set(cacheKey, {
          expiresAt: Date.now() + DISCOVER_FIXTURE_CACHE_TTL_MS,
          value: response,
        });
        return response;
      }

      const fixtureBatches = await Promise.all(
        competitions.map(async (competition) => {
          try {
            const fixtures = await apiFootballService.getFixtures(
              competition.id,
              season,
              from,
              to
            );

            await Promise.all(fixtures.map((fixture) => saveApiFixtureToDatabase(fixture)));

            return fixtures.map(normalizeFixture).slice(0, 10);
          } catch (error) {
            console.error(`Error loading fixtures for competition ${competition.id}:`, error);
            return [];
          }
        })
      );

      const fixtures = fixtureBatches
        .flat()
        .sort(sortDiscoverFixtures)
        .slice(0, Number.isFinite(limit) ? limit : 12);

      const response = {
        competitions: competitionSummaries,
        fixtures,
      };

      discoverFixtureCache.set(cacheKey, {
        expiresAt: Date.now() + DISCOVER_FIXTURE_CACHE_TTL_MS,
        value: response,
      });

      return response;
    })();

    discoverFixtureRequests.set(cacheKey, requestPromise);

    try {
      const response = await requestPromise;
      return NextResponse.json(response);
    } finally {
      discoverFixtureRequests.delete(cacheKey);
    }
  } catch (error) {
    console.error('Error fetching discover fixtures:', error);
    return NextResponse.json({ error: 'Failed to load fixtures' }, { status: 500 });
  }
}

