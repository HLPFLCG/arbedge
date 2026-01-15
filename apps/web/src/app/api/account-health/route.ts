export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db-edge';
import { getAuthenticatedUser, unauthorizedResponse, errorResponse, successResponse } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return unauthorizedResponse();

  try {
    const sql = getDb();

    // Get sports accounts with CLV data
    const accounts = await sql`
      SELECT
        sa.id, sa.status, sa.balance, sa.notes,
        sb.id as "sportsbookId", sb.name as "sportsbookName", sb.slug as "sportsbookSlug",
        COUNT(c.id) as "totalBets",
        COALESCE(AVG(c."clvPercent"), 0) as "avgClv",
        (
          SELECT AVG(c2."clvPercent")
          FROM clv_records c2
          WHERE c2."sportsAccountId" = sa.id
            AND c2."recordedAt" > NOW() - INTERVAL '7 days'
        ) as "recentAvgClv",
        (
          SELECT AVG(c3."clvPercent")
          FROM clv_records c3
          WHERE c3."sportsAccountId" = sa.id
            AND c3."recordedAt" > NOW() - INTERVAL '30 days'
            AND c3."recordedAt" <= NOW() - INTERVAL '7 days'
        ) as "previousAvgClv"
      FROM sports_accounts sa
      JOIN sportsbooks sb ON sb.id = sa."sportsbookId"
      LEFT JOIN clv_records c ON c."sportsAccountId" = sa.id
      WHERE sa."userId" = ${user.id}
      GROUP BY sa.id, sb.id
      ORDER BY sb.name
    `;

    // Calculate health status and recommendations for each account
    const accountHealth = accounts.map(account => {
      const avgClv = parseFloat(account.avgClv) || 0;
      const recentAvgClv = parseFloat(account.recentAvgClv) || avgClv;
      const previousAvgClv = parseFloat(account.previousAvgClv) || recentAvgClv;

      // Determine trend
      let clvTrend: 'improving' | 'stable' | 'declining' = 'stable';
      const clvDiff = previousAvgClv - recentAvgClv;
      if (clvDiff > 0.5) {
        clvTrend = 'improving'; // Lower CLV is better (less likely to be limited)
      } else if (clvDiff < -0.5) {
        clvTrend = 'declining';
      }

      // Determine status and risk level
      let status: 'healthy' | 'warning' | 'at_risk' = 'healthy';
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      const recommendations: string[] = [];

      if (avgClv >= 5) {
        status = 'at_risk';
        riskLevel = 'high';
        recommendations.push('URGENT: This account is at high risk of being limited');
        recommendations.push('Reduce bet sizes significantly or use alternative accounts');
        recommendations.push('Mix in some recreational bets to appear less sharp');
      } else if (avgClv >= 3) {
        status = 'warning';
        riskLevel = 'medium';
        recommendations.push('Consider reducing bet sizes by 20%');
        recommendations.push('Avoid betting immediately when odds are posted');
      } else if (avgClv >= 2) {
        status = 'warning';
        riskLevel = 'medium';
        recommendations.push('Monitor this account closely');
      }

      // Account status-based adjustments
      if (account.status === 'LIMITED') {
        status = 'at_risk';
        riskLevel = 'critical';
        recommendations.unshift('Account has been limited by sportsbook');
      } else if (account.status === 'SUSPENDED') {
        status = 'at_risk';
        riskLevel = 'critical';
        recommendations.unshift('Account is suspended');
      }

      return {
        id: account.id,
        sportsbookId: account.sportsbookId,
        sportsbookName: account.sportsbookName,
        sportsbookSlug: account.sportsbookSlug,
        status,
        accountStatus: account.status,
        clvAverage: parseFloat(avgClv.toFixed(2)),
        clvTrend,
        totalBets: parseInt(account.totalBets) || 0,
        riskLevel,
        recommendations,
        balance: account.balance ? parseFloat(account.balance) : null,
      };
    });

    // Calculate overall health score
    const healthyAccounts = accountHealth.filter(a => a.status === 'healthy').length;
    const totalAccounts = accountHealth.length;
    const overallHealthScore = totalAccounts > 0
      ? Math.round((healthyAccounts / totalAccounts) * 100)
      : 100;

    return successResponse({
      accounts: accountHealth,
      summary: {
        totalAccounts,
        healthyAccounts,
        warningAccounts: accountHealth.filter(a => a.status === 'warning').length,
        atRiskAccounts: accountHealth.filter(a => a.status === 'at_risk').length,
        overallHealthScore,
      },
    });
  } catch (error) {
    console.error('Get account health error:', error);
    return errorResponse('Failed to get account health');
  }
}
