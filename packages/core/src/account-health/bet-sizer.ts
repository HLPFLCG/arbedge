import Decimal from 'decimal.js';
import type { AccountCLVSummary } from './clv-tracker';

export interface BetSizingParams {
  bankroll: number;
  profitPercent: number; // Expected profit percentage from arbitrage
  confidence: number; // 0-100 confidence score
  accountHealth?: AccountCLVSummary;
}

export interface BetSizingResult {
  recommendedStake: number;
  maxStake: number;
  kellyStake: number;
  adjustedReason: string[];
}

export class BetSizer {
  private readonly MAX_BANKROLL_PERCENT = 0.25; // Max 25% of bankroll per trade
  private readonly MIN_STAKE = 10; // Minimum $10 stake

  /**
   * Calculate optimal bet size using modified Kelly Criterion
   */
  calculateOptimalSize(params: BetSizingParams): BetSizingResult {
    const { bankroll, profitPercent, confidence, accountHealth } = params;
    const reasons: string[] = [];

    // Base Kelly calculation for guaranteed profit
    // For arbitrage, the edge is the profit percent
    const edge = profitPercent / 100;
    const kellyFraction = edge; // Simplified Kelly for arbitrage

    // Start with full Kelly stake
    let kellyStake = new Decimal(bankroll).times(kellyFraction).toNumber();

    // Apply quarter Kelly for safety
    let adjustedStake = kellyStake * 0.25;
    reasons.push('Applied quarter Kelly for risk management');

    // Adjust for confidence
    if (confidence < 80) {
      const confidenceMultiplier = confidence / 100;
      adjustedStake *= confidenceMultiplier;
      reasons.push(`Reduced stake by ${Math.round((1 - confidenceMultiplier) * 100)}% due to lower confidence`);
    }

    // Adjust for account health
    if (accountHealth) {
      const healthMultiplier = this.getHealthMultiplier(accountHealth);
      if (healthMultiplier < 1) {
        adjustedStake *= healthMultiplier;
        reasons.push(
          `Reduced stake by ${Math.round((1 - healthMultiplier) * 100)}% due to account health concerns`
        );
      }
    }

    // Apply maximum bankroll percentage cap
    const maxStake = bankroll * this.MAX_BANKROLL_PERCENT;
    if (adjustedStake > maxStake) {
      adjustedStake = maxStake;
      reasons.push(`Capped at ${this.MAX_BANKROLL_PERCENT * 100}% of bankroll`);
    }

    // Apply minimum stake
    if (adjustedStake < this.MIN_STAKE) {
      adjustedStake = this.MIN_STAKE;
      reasons.push(`Raised to minimum stake of $${this.MIN_STAKE}`);
    }

    // Round to nearest dollar
    adjustedStake = Math.round(adjustedStake);

    return {
      recommendedStake: adjustedStake,
      maxStake: Math.round(maxStake),
      kellyStake: Math.round(kellyStake),
      adjustedReason: reasons,
    };
  }

  /**
   * Calculate stake distribution for multiple sportsbook accounts
   */
  distributeStakes(
    totalStake: number,
    accountBalances: { sportsbookId: string; balance: number }[]
  ): { sportsbookId: string; stake: number }[] {
    const totalBalance = accountBalances.reduce((s, a) => s + a.balance, 0);

    if (totalBalance < totalStake) {
      throw new Error(
        `Insufficient total balance ($${totalBalance}) for stake ($${totalStake})`
      );
    }

    return accountBalances.map((account) => ({
      sportsbookId: account.sportsbookId,
      stake: Math.round((account.balance / totalBalance) * totalStake),
    }));
  }

  /**
   * Calculate stake to avoid common detection patterns
   */
  obfuscateStake(stake: number): number {
    // Avoid round numbers
    const variations = [-3, -2, -1, 1, 2, 3, 7, 8, 9, 11, 12, 13];
    const randomVariation = variations[Math.floor(Math.random() * variations.length)];

    // Round to nearest $5, then add variation
    const rounded = Math.round(stake / 5) * 5;
    const obfuscated = rounded + randomVariation;

    // Ensure still positive
    return Math.max(this.MIN_STAKE, obfuscated);
  }

  private getHealthMultiplier(health: AccountCLVSummary): number {
    switch (health.riskLevel) {
      case 'critical':
        return 0.25; // Reduce to 25%
      case 'high':
        return 0.5; // Reduce to 50%
      case 'medium':
        return 0.75; // Reduce to 75%
      default:
        return 1; // No reduction
    }
  }
}
