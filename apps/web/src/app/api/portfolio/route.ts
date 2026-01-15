export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db-edge';
import { getAuthenticatedUser, unauthorizedResponse, errorResponse, successResponse } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return unauthorizedResponse();

  try {
    const sql = getDb();

    // Get portfolio
    const portfolios = await sql`
      SELECT id, "totalBankroll", currency, "createdAt"
      FROM portfolios
      WHERE "userId" = ${user.id}
    `;

    if (portfolios.length === 0) {
      return errorResponse('Portfolio not found', 404);
    }

    const portfolio = portfolios[0];

    // Get sports accounts with balances
    const sportsAccounts = await sql`
      SELECT
        sa.id, sa.balance, sa.status, sa.notes,
        sb.name as "sportsbookName", sb.slug as "sportsbookSlug"
      FROM sports_accounts sa
      JOIN sportsbooks sb ON sb.id = sa."sportsbookId"
      WHERE sa."userId" = ${user.id}
      ORDER BY sb.name
    `;

    // Get recent bets
    const recentBets = await sql`
      SELECT
        b.id, b."eventDescription" as event, b.selection, b.odds,
        b.stake, b."potentialPayout", b.result, b."actualPayout",
        b."placedAt", b."settledAt",
        sb.name as "sportsbookName"
      FROM bets b
      JOIN sports_accounts sa ON sa.id = b."sportsAccountId"
      JOIN sportsbooks sb ON sb.id = sa."sportsbookId"
      WHERE b."userId" = ${user.id}
      ORDER BY b."placedAt" DESC
      LIMIT 10
    `;

    // Calculate P&L summaries
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const pnlSummary = await sql`
      SELECT
        COALESCE(SUM(CASE WHEN "settledAt" >= ${todayStart} THEN
          CASE WHEN result = 'WON' THEN "actualPayout" - stake
               WHEN result = 'LOST' THEN -stake
               ELSE 0 END
        ELSE 0 END), 0) as "todayPnL",
        COALESCE(SUM(CASE WHEN "settledAt" >= ${weekStart} THEN
          CASE WHEN result = 'WON' THEN "actualPayout" - stake
               WHEN result = 'LOST' THEN -stake
               ELSE 0 END
        ELSE 0 END), 0) as "weekPnL",
        COALESCE(SUM(CASE WHEN "settledAt" >= ${monthStart} THEN
          CASE WHEN result = 'WON' THEN "actualPayout" - stake
               WHEN result = 'LOST' THEN -stake
               ELSE 0 END
        ELSE 0 END), 0) as "monthPnL",
        COUNT(*) as "totalBets",
        COALESCE(
          COUNT(*) FILTER (WHERE result = 'WON')::float /
          NULLIF(COUNT(*) FILTER (WHERE result IN ('WON', 'LOST')), 0) * 100,
          0
        ) as "winRate"
      FROM bets
      WHERE "userId" = ${user.id}
    `;

    return successResponse({
      portfolio: {
        ...portfolio,
        totalBankroll: parseFloat(portfolio.totalBankroll) || 0,
        ...pnlSummary[0],
      },
      sportsAccounts: sportsAccounts.map(a => ({
        ...a,
        balance: parseFloat(a.balance) || 0,
      })),
      recentBets: recentBets.map(b => ({
        ...b,
        stake: parseFloat(b.stake),
        potentialPayout: parseFloat(b.potentialPayout),
        actualPayout: b.actualPayout ? parseFloat(b.actualPayout) : null,
        profit: b.result === 'WON' ? parseFloat(b.actualPayout) - parseFloat(b.stake) :
                b.result === 'LOST' ? -parseFloat(b.stake) : 0,
      })),
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    return errorResponse('Failed to get portfolio');
  }
}
