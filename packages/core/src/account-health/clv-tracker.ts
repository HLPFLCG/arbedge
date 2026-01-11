import { calculateCLV } from '@arbedge/shared';

export interface CLVData {
  betId: string;
  sportsAccountId: string;
  sportsbookId: string;
  openingOdds: number;
  closingOdds: number;
  clvPercent: number;
  recordedAt: Date;
}

export interface AccountCLVSummary {
  sportsAccountId: string;
  sportsbookId: string;
  totalBets: number;
  averageCLV: number;
  clvTrend: 'improving' | 'stable' | 'declining';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: Date;
}

export class CLVTracker {
  private readonly CLV_THRESHOLD_LOW = 0; // 0% - breaking even
  private readonly CLV_THRESHOLD_MEDIUM = 2; // 2% - moderately winning
  private readonly CLV_THRESHOLD_HIGH = 4; // 4% - clearly winning
  private readonly CLV_THRESHOLD_CRITICAL = 6; // 6% - likely to be limited

  /**
   * Calculate CLV for a single bet
   */
  calculateBetCLV(openingOdds: number, closingOdds: number): number {
    return calculateCLV(openingOdds, closingOdds);
  }

  /**
   * Analyze CLV history for an account
   */
  analyzeAccount(clvHistory: CLVData[]): AccountCLVSummary {
    if (clvHistory.length === 0) {
      throw new Error('No CLV data to analyze');
    }

    const sportsAccountId = clvHistory[0].sportsAccountId;
    const sportsbookId = clvHistory[0].sportsbookId;

    // Calculate average CLV
    const totalCLV = clvHistory.reduce((sum, c) => sum + c.clvPercent, 0);
    const averageCLV = totalCLV / clvHistory.length;

    // Calculate trend (last 10 vs previous 10)
    const trend = this.calculateTrend(clvHistory);

    // Determine risk level
    const riskLevel = this.determineRiskLevel(averageCLV, clvHistory.length);

    return {
      sportsAccountId,
      sportsbookId,
      totalBets: clvHistory.length,
      averageCLV: Math.round(averageCLV * 100) / 100,
      clvTrend: trend,
      riskLevel,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get recommendations based on CLV analysis
   */
  getRecommendations(summary: AccountCLVSummary): string[] {
    const recommendations: string[] = [];

    if (summary.riskLevel === 'critical') {
      recommendations.push(
        'URGENT: This account is at high risk of being limited. Consider reducing bet sizes significantly or using alternative accounts.'
      );
      recommendations.push('Avoid betting sharp lines that move significantly.');
      recommendations.push('Mix in some recreational bets to appear less sharp.');
    } else if (summary.riskLevel === 'high') {
      recommendations.push(
        'This account shows consistent positive CLV. Monitor closely for limits.'
      );
      recommendations.push('Consider reducing max bet sizes by 20-30%.');
      recommendations.push('Avoid betting immediately when odds are first posted.');
    } else if (summary.riskLevel === 'medium') {
      recommendations.push('Account CLV is moderately positive. Continue monitoring.');
      recommendations.push('Vary bet timing to avoid detection patterns.');
    }

    if (summary.clvTrend === 'declining') {
      recommendations.push(
        'CLV trend is declining - your edge may be detected. Consider adjusting strategy.'
      );
    }

    if (summary.totalBets > 100 && summary.averageCLV > 3) {
      recommendations.push(
        'High sample size with consistent positive CLV. This account may be flagged soon.'
      );
    }

    return recommendations;
  }

  private calculateTrend(
    clvHistory: CLVData[]
  ): 'improving' | 'stable' | 'declining' {
    if (clvHistory.length < 20) return 'stable';

    // Sort by date
    const sorted = [...clvHistory].sort(
      (a, b) => a.recordedAt.getTime() - b.recordedAt.getTime()
    );

    // Compare recent 10 vs previous 10
    const recent = sorted.slice(-10);
    const previous = sorted.slice(-20, -10);

    const recentAvg = recent.reduce((s, c) => s + c.clvPercent, 0) / 10;
    const previousAvg = previous.reduce((s, c) => s + c.clvPercent, 0) / 10;

    const diff = recentAvg - previousAvg;
    if (diff > 0.5) return 'improving';
    if (diff < -0.5) return 'declining';
    return 'stable';
  }

  private determineRiskLevel(
    averageCLV: number,
    sampleSize: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    // Need sufficient sample size for reliable assessment
    if (sampleSize < 20) {
      // With small sample, use higher thresholds
      if (averageCLV >= this.CLV_THRESHOLD_CRITICAL * 1.5) return 'high';
      if (averageCLV >= this.CLV_THRESHOLD_HIGH * 1.5) return 'medium';
      return 'low';
    }

    if (averageCLV >= this.CLV_THRESHOLD_CRITICAL) return 'critical';
    if (averageCLV >= this.CLV_THRESHOLD_HIGH) return 'high';
    if (averageCLV >= this.CLV_THRESHOLD_MEDIUM) return 'medium';
    return 'low';
  }
}
