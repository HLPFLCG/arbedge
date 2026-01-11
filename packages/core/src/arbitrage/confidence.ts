import type { Odds } from '@arbedge/shared';

export interface ConfidenceFactors {
  oddsAge: number; // 0-30 points
  profitMargin: number; // 0-30 points
  sportsbookTier: number; // 0-20 points
  marketLiquidity: number; // 0-10 points
  historicalAccuracy: number; // 0-10 points
}

export interface ConfidenceResult {
  score: number; // 0-100
  factors: ConfidenceFactors;
  warnings: string[];
}

export class ConfidenceScorer {
  private readonly SPORTSBOOK_TIERS: Record<string, number> = {
    draftkings: 1,
    fanduel: 1,
    betmgm: 1,
    caesars: 1,
    espnbet: 1,
  };

  /**
   * Calculate comprehensive confidence score for an arbitrage opportunity
   */
  calculateConfidence(
    odds: Odds[],
    profitPercent: number,
    isLive: boolean = false
  ): ConfidenceResult {
    const warnings: string[] = [];

    // Calculate individual factors
    const oddsAge = this.scoreOddsAge(odds, warnings);
    const profitMargin = this.scoreProfitMargin(profitPercent, warnings);
    const sportsbookTier = this.scoreSportsbookTier(odds);
    const marketLiquidity = this.scoreMarketLiquidity(isLive, warnings);
    const historicalAccuracy = this.scoreHistoricalAccuracy(odds);

    const factors: ConfidenceFactors = {
      oddsAge,
      profitMargin,
      sportsbookTier,
      marketLiquidity,
      historicalAccuracy,
    };

    const score = Math.min(
      100,
      Math.max(0, oddsAge + profitMargin + sportsbookTier + marketLiquidity + historicalAccuracy)
    );

    return { score, factors, warnings };
  }

  private scoreOddsAge(odds: Odds[], warnings: string[]): number {
    const now = Date.now();
    const ages = odds.map((o) => now - o.timestamp.getTime());
    const maxAge = Math.max(...ages);

    if (maxAge > 120000) {
      // > 2 minutes
      warnings.push('Odds data is very stale (>2 min). High risk of invalid opportunity.');
      return 0;
    }
    if (maxAge > 60000) {
      // > 1 minute
      warnings.push('Odds data is stale (>1 min). Verify before placing bets.');
      return 10;
    }
    if (maxAge > 30000) {
      // > 30 seconds
      warnings.push('Odds data is moderately stale (>30s).');
      return 20;
    }
    if (maxAge > 10000) {
      // > 10 seconds
      return 25;
    }
    return 30; // Fresh odds
  }

  private scoreProfitMargin(profitPercent: number, warnings: string[]): number {
    if (profitPercent > 10) {
      warnings.push(
        'Unusually high profit margin. Likely a pricing error that will be voided.'
      );
      return 0;
    }
    if (profitPercent > 7) {
      warnings.push('High profit margin. Verify odds are accurate.');
      return 10;
    }
    if (profitPercent > 5) {
      return 20;
    }
    if (profitPercent > 3) {
      return 25;
    }
    if (profitPercent >= 1) {
      return 30; // Sweet spot: realistic profit
    }
    return 25; // < 1% still valid but tight
  }

  private scoreSportsbookTier(odds: Odds[]): number {
    const tiers = odds.map((o) => this.SPORTSBOOK_TIERS[o.sportsbookId] || 3);
    const avgTier = tiers.reduce((a, b) => a + b, 0) / tiers.length;

    if (avgTier <= 1.2) return 20; // All Tier 1
    if (avgTier <= 1.5) return 15; // Mostly Tier 1
    if (avgTier <= 2) return 10; // Mixed
    return 5; // Lower tier books
  }

  private scoreMarketLiquidity(isLive: boolean, warnings: string[]): number {
    if (isLive) {
      warnings.push('Live market. Odds change rapidly. Execute quickly.');
      return 3;
    }
    return 10; // Pre-match more stable
  }

  private scoreHistoricalAccuracy(odds: Odds[]): number {
    // In a real implementation, this would use historical data
    // For now, return a default score
    return 10;
  }

  /**
   * Get a human-readable confidence level
   */
  getConfidenceLevel(score: number): 'low' | 'medium' | 'high' | 'very-high' {
    if (score >= 80) return 'very-high';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  /**
   * Get a color for the confidence score
   */
  getConfidenceColor(score: number): string {
    if (score >= 80) return 'green';
    if (score >= 60) return 'lime';
    if (score >= 40) return 'yellow';
    if (score >= 20) return 'orange';
    return 'red';
  }
}
