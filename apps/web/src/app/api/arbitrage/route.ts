export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db-edge';
import { getAuthenticatedUser, unauthorizedResponse, errorResponse, successResponse } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const sport = searchParams.get('sport');
    const minProfit = searchParams.get('minProfit');
    const maxProfit = searchParams.get('maxProfit');
    const minConfidence = searchParams.get('minConfidence');
    const marketType = searchParams.get('marketType');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const sql = getDb();

    // Build query with filters
    // Note: Using dynamic WHERE clauses in tagged template literals is tricky
    // For now, we'll fetch and filter - in production, use proper query builders

    const arbitrages = await sql`
      SELECT
        a.id, a."marketType", a."profitPercent", a.confidence, a.status,
        a."detectedAt", a."expiresAt", a."isLive",
        e.id as "eventId", e."homeTeam", e."awayTeam", e."startTime",
        l.name as "leagueName", l.slug as "leagueSlug",
        s.name as "sportName", s.slug as "sportSlug"
      FROM arbitrages a
      JOIN events e ON e.id = a."eventId"
      JOIN leagues l ON l.id = e."leagueId"
      JOIN sports s ON s.id = l."sportId"
      WHERE a.status = 'ACTIVE'
        AND (a."expiresAt" IS NULL OR a."expiresAt" > NOW())
      ORDER BY a."profitPercent" DESC, a."detectedAt" DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    // Fetch legs for each arbitrage
    const arbitrageIds = arbitrages.map(a => a.id);

    let legs: any[] = [];
    if (arbitrageIds.length > 0) {
      legs = await sql`
        SELECT
          al.id, al."arbitrageId", al.selection, al.price, al."decimalPrice",
          al.line, al."stakePercent",
          sb.id as "sportsbookId", sb.name as "sportsbookName", sb.slug as "sportsbookSlug"
        FROM arbitrage_legs al
        JOIN sportsbooks sb ON sb.id = al."sportsbookId"
        WHERE al."arbitrageId" = ANY(${arbitrageIds})
      `;
    }

    // Group legs by arbitrage
    const legsByArbitrage = legs.reduce((acc, leg) => {
      if (!acc[leg.arbitrageId]) acc[leg.arbitrageId] = [];
      acc[leg.arbitrageId].push(leg);
      return acc;
    }, {} as Record<string, typeof legs>);

    // Combine and filter
    let results = arbitrages.map(arb => ({
      id: arb.id,
      eventId: arb.eventId,
      eventName: `${arb.homeTeam} @ ${arb.awayTeam}`,
      sportName: arb.sportName,
      sportSlug: arb.sportSlug,
      leagueName: arb.leagueName,
      leagueSlug: arb.leagueSlug,
      marketType: arb.marketType,
      profitPercent: arb.profitPercent,
      confidence: arb.confidence,
      status: arb.status,
      detectedAt: arb.detectedAt,
      expiresAt: arb.expiresAt,
      eventStartTime: arb.startTime,
      isLive: arb.isLive,
      legs: (legsByArbitrage[arb.id] || []).map((leg: any) => ({
        id: leg.id,
        sportsbookId: leg.sportsbookId,
        sportsbookName: leg.sportsbookName,
        sportsbookSlug: leg.sportsbookSlug,
        selection: leg.selection,
        price: leg.price,
        decimalPrice: leg.decimalPrice,
        line: leg.line,
        stakePercent: leg.stakePercent,
      })),
    }));

    // Apply client-side filters
    if (sport) {
      results = results.filter(r => r.sportSlug === sport);
    }
    if (minProfit) {
      results = results.filter(r => r.profitPercent >= parseFloat(minProfit));
    }
    if (maxProfit) {
      results = results.filter(r => r.profitPercent <= parseFloat(maxProfit));
    }
    if (minConfidence) {
      results = results.filter(r => r.confidence >= parseInt(minConfidence));
    }
    if (marketType) {
      results = results.filter(r => r.marketType === marketType);
    }

    // Get stats
    const stats = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'ACTIVE' AND ("expiresAt" IS NULL OR "expiresAt" > NOW())) as "activeCount",
        COALESCE(AVG("profitPercent") FILTER (WHERE status = 'ACTIVE'), 0) as "avgProfit",
        COALESCE(MAX("profitPercent") FILTER (WHERE status = 'ACTIVE'), 0) as "maxProfit",
        COUNT(*) FILTER (WHERE "detectedAt" > NOW() - INTERVAL '24 hours') as "last24h"
      FROM arbitrages
    `;

    return successResponse({
      arbitrages: results,
      stats: {
        activeCount: parseInt(stats[0]?.activeCount || '0'),
        avgProfit: parseFloat(stats[0]?.avgProfit || '0'),
        maxProfit: parseFloat(stats[0]?.maxProfit || '0'),
        last24hCount: parseInt(stats[0]?.last24h || '0'),
      },
      pagination: {
        limit,
        offset,
        hasMore: results.length === limit,
      },
    });
  } catch (error) {
    console.error('Get arbitrage error:', error);
    return errorResponse('Failed to get arbitrage opportunities');
  }
}
