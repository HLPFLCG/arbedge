import type { Odds, Market } from '@arbedge/shared';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class OddsValidator {
  private readonly MIN_DECIMAL_ODDS = 1.01;
  private readonly MAX_DECIMAL_ODDS = 1000;
  private readonly MAX_ODDS_AGE_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Validate a single odds entry
   */
  validateOdds(odds: Odds): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check decimal odds range
    if (odds.decimalPrice < this.MIN_DECIMAL_ODDS) {
      errors.push(`Decimal odds ${odds.decimalPrice} below minimum ${this.MIN_DECIMAL_ODDS}`);
    }
    if (odds.decimalPrice > this.MAX_DECIMAL_ODDS) {
      errors.push(`Decimal odds ${odds.decimalPrice} above maximum ${this.MAX_DECIMAL_ODDS}`);
    }

    // Check for consistency between American and decimal
    const expectedDecimal = this.americanToDecimal(odds.price);
    const tolerance = 0.01;
    if (Math.abs(odds.decimalPrice - expectedDecimal) > tolerance) {
      warnings.push(
        `American odds ${odds.price} doesn't match decimal ${odds.decimalPrice} (expected ${expectedDecimal})`
      );
    }

    // Check timestamp freshness
    const age = Date.now() - odds.timestamp.getTime();
    if (age > this.MAX_ODDS_AGE_MS) {
      warnings.push(`Odds are ${Math.round(age / 1000)}s old, may be stale`);
    }
    if (age < 0) {
      errors.push('Odds timestamp is in the future');
    }

    // Check for required fields
    if (!odds.sportsbookId) {
      errors.push('Missing sportsbookId');
    }
    if (!odds.selection) {
      errors.push('Missing selection');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate a market's odds for arbitrage detection
   */
  validateMarket(market: Market): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Need at least 2 odds from different sportsbooks
    if (market.odds.length < 2) {
      errors.push('Need at least 2 odds entries for arbitrage detection');
    }

    // Check for unique sportsbooks
    const sportsbooks = new Set(market.odds.map((o) => o.sportsbookId));
    if (sportsbooks.size < 2) {
      errors.push('Need odds from at least 2 different sportsbooks');
    }

    // Validate each odds entry
    for (const odds of market.odds) {
      const result = this.validateOdds(odds);
      errors.push(...result.errors.map((e) => `[${odds.sportsbookId}] ${e}`));
      warnings.push(...result.warnings.map((w) => `[${odds.sportsbookId}] ${w}`));
    }

    // Check for suspicious patterns
    const decimalPrices = market.odds.map((o) => o.decimalPrice);
    if (this.hasIdenticalOdds(decimalPrices)) {
      warnings.push('Multiple identical odds detected - may indicate stale data');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate an arbitrage opportunity
   */
  validateArbitrage(
    profitPercent: number,
    odds: Odds[]
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check profit is positive but not suspiciously high
    if (profitPercent <= 0) {
      errors.push('No arbitrage opportunity (profit <= 0)');
    }
    if (profitPercent > 10) {
      warnings.push(
        'Profit >10% is suspicious - likely a palpable error that may be voided'
      );
    }
    if (profitPercent > 20) {
      errors.push('Profit >20% is almost certainly an error');
    }

    // Check all odds are from different sportsbooks
    const sportsbooks = new Set(odds.map((o) => o.sportsbookId));
    if (sportsbooks.size !== odds.length) {
      errors.push('Cannot use same sportsbook for multiple legs');
    }

    // Check lines match (for spread/total arbs)
    const lines = odds.map((o) => o.line).filter((l) => l !== undefined);
    if (lines.length > 0 && new Set(lines).size > 1) {
      // For spreads, lines should be opposite (e.g., -3.5 and +3.5)
      const sortedLines = [...lines].sort((a, b) => a! - b!);
      if (sortedLines[0]! + sortedLines[sortedLines.length - 1]! !== 0) {
        warnings.push('Lines do not mirror - verify this is a valid arb');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private americanToDecimal(american: number): number {
    if (american > 0) {
      return american / 100 + 1;
    }
    return 100 / Math.abs(american) + 1;
  }

  private hasIdenticalOdds(prices: number[]): boolean {
    const counts = new Map<number, number>();
    for (const price of prices) {
      counts.set(price, (counts.get(price) || 0) + 1);
    }
    return Array.from(counts.values()).some((count) => count > 1);
  }
}
