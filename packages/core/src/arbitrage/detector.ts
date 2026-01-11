import Decimal from 'decimal.js';
import type { Odds, Market, MarketType } from '@arbedge/shared';

export interface ArbitrageOpportunity {
  eventId: string;
  marketType: MarketType;
  profitPercent: number;
  legs: ArbitrageLeg[];
  confidence: number;
  detectedAt: Date;
}

export interface ArbitrageLeg {
  sportsbookId: string;
  sportsbookName: string;
  selection: string;
  price: number;
  decimalPrice: number;
  line?: number;
  stakePercent: number;
}

interface OddsGroup {
  market: Market;
  oddsBySelection: Map<string, Odds[]>;
}

export class ArbitrageDetector {
  private readonly MIN_PROFIT_THRESHOLD = 0.5; // 0.5% minimum profit
  private readonly MAX_PROFIT_THRESHOLD = 15; // 15% max (likely error)

  /**
   * Detect all arbitrage opportunities from a list of markets
   */
  detectAll(markets: Market[]): ArbitrageOpportunity[] {
    const opportunities: ArbitrageOpportunity[] = [];

    for (const market of markets) {
      const oddsGroup = this.groupOddsBySelection(market);

      let opportunity: ArbitrageOpportunity | null = null;

      if (market.type === 'MONEYLINE' || market.type === 'TOTAL') {
        opportunity = this.detectTwoWay(oddsGroup);
      }
      // Three-way for soccer moneyline would go here

      if (opportunity) {
        opportunities.push(opportunity);
      }
    }

    // Sort by profit percentage descending
    return opportunities.sort((a, b) => b.profitPercent - a.profitPercent);
  }

  /**
   * Two-way arbitrage detection (moneyline, over/under, spread)
   * Formula: 1/odds1 + 1/odds2 < 1 indicates arbitrage
   */
  detectTwoWay(oddsGroup: OddsGroup): ArbitrageOpportunity | null {
    const selections = Array.from(oddsGroup.oddsBySelection.keys());
    if (selections.length !== 2) return null;

    const [sel1, sel2] = selections;
    const odds1List = oddsGroup.oddsBySelection.get(sel1) || [];
    const odds2List = oddsGroup.oddsBySelection.get(sel2) || [];

    let bestOpportunity: ArbitrageOpportunity | null = null;

    // Find best combination across all sportsbooks
    for (const odds1 of odds1List) {
      for (const odds2 of odds2List) {
        // Skip same sportsbook
        if (odds1.sportsbookId === odds2.sportsbookId) continue;

        const opportunity = this.calculateTwoWayArbitrage(
          oddsGroup.market,
          odds1,
          odds2,
          sel1,
          sel2
        );

        if (opportunity) {
          if (!bestOpportunity || opportunity.profitPercent > bestOpportunity.profitPercent) {
            bestOpportunity = opportunity;
          }
        }
      }
    }

    return bestOpportunity;
  }

  private calculateTwoWayArbitrage(
    market: Market,
    odds1: Odds,
    odds2: Odds,
    sel1: string,
    sel2: string
  ): ArbitrageOpportunity | null {
    const impliedProb1 = new Decimal(1).div(odds1.decimalPrice);
    const impliedProb2 = new Decimal(1).div(odds2.decimalPrice);
    const totalImplied = impliedProb1.plus(impliedProb2);

    // Only an arbitrage if total implied probability < 1
    if (totalImplied.gte(1)) return null;

    const profitPercent = new Decimal(1)
      .minus(totalImplied)
      .div(totalImplied)
      .times(100)
      .toNumber();

    // Filter out opportunities that are too small or suspiciously large
    if (profitPercent < this.MIN_PROFIT_THRESHOLD) return null;
    if (profitPercent > this.MAX_PROFIT_THRESHOLD) return null;

    // Calculate stake percentages
    const stake1Percent = impliedProb1.div(totalImplied).times(100).toNumber();
    const stake2Percent = impliedProb2.div(totalImplied).times(100).toNumber();

    // Calculate confidence score
    const confidence = this.calculateConfidence(odds1, odds2, profitPercent);

    return {
      eventId: market.eventId,
      marketType: market.type,
      profitPercent: Math.round(profitPercent * 100) / 100,
      detectedAt: new Date(),
      confidence,
      legs: [
        {
          sportsbookId: odds1.sportsbookId,
          sportsbookName: odds1.sportsbookName,
          selection: sel1,
          price: odds1.price,
          decimalPrice: odds1.decimalPrice,
          line: odds1.line,
          stakePercent: Math.round(stake1Percent * 100) / 100,
        },
        {
          sportsbookId: odds2.sportsbookId,
          sportsbookName: odds2.sportsbookName,
          selection: sel2,
          price: odds2.price,
          decimalPrice: odds2.decimalPrice,
          line: odds2.line,
          stakePercent: Math.round(stake2Percent * 100) / 100,
        },
      ],
    };
  }

  /**
   * Confidence scoring based on multiple factors
   */
  private calculateConfidence(odds1: Odds, odds2: Odds, profitPercent: number): number {
    let score = 100;
    const now = Date.now();

    // Deduct for odds age (stale odds reduce confidence)
    const age1 = now - odds1.timestamp.getTime();
    const age2 = now - odds2.timestamp.getTime();
    const maxAge = Math.max(age1, age2);

    if (maxAge > 60000) score -= 30; // > 60 seconds
    else if (maxAge > 30000) score -= 20; // > 30 seconds
    else if (maxAge > 10000) score -= 10; // > 10 seconds
    else if (maxAge > 5000) score -= 5; // > 5 seconds

    // Deduct for unusual profit margins (likely errors)
    if (profitPercent > 10) score -= 30;
    else if (profitPercent > 7) score -= 20;
    else if (profitPercent > 5) score -= 10;

    // Deduct for live events (more volatile)
    if (odds1.isLive || odds2.isLive) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  private groupOddsBySelection(market: Market): OddsGroup {
    const oddsBySelection = new Map<string, Odds[]>();

    for (const odds of market.odds) {
      const existing = oddsBySelection.get(odds.selection) || [];
      existing.push(odds);
      oddsBySelection.set(odds.selection, existing);
    }

    return { market, oddsBySelection };
  }
}
