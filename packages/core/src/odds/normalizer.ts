import { americanToDecimal, decimalToAmerican } from '@arbedge/shared';
import type { OddsUpdate } from '@arbedge/shared';

export interface NormalizedOdds {
  sportsbookId: string;
  eventId: string;
  marketType: string;
  selection: string;
  americanPrice: number;
  decimalPrice: number;
  impliedProbability: number;
  line?: number;
  timestamp: Date;
}

export class OddsNormalizer {
  /**
   * Normalize odds from various formats to a standard format
   */
  normalize(raw: OddsUpdate): NormalizedOdds {
    return {
      sportsbookId: raw.sportsbookId,
      eventId: raw.eventId,
      marketType: raw.marketType,
      selection: raw.selection,
      americanPrice: raw.price,
      decimalPrice: raw.decimalPrice || americanToDecimal(raw.price),
      impliedProbability: 1 / (raw.decimalPrice || americanToDecimal(raw.price)),
      line: raw.line,
      timestamp: new Date(raw.timestamp),
    };
  }

  /**
   * Normalize selection names across sportsbooks
   * Different books use different naming conventions
   */
  normalizeSelection(selection: string, marketType: string): string {
    const lower = selection.toLowerCase().trim();

    // Moneyline
    if (marketType === 'MONEYLINE') {
      if (lower.includes('home') || lower === 'h') return 'home';
      if (lower.includes('away') || lower === 'a') return 'away';
      if (lower === 'draw' || lower === 'tie' || lower === 'x') return 'draw';
    }

    // Totals
    if (marketType === 'TOTAL') {
      if (lower.startsWith('over') || lower === 'o') return 'over';
      if (lower.startsWith('under') || lower === 'u') return 'under';
    }

    // Spreads
    if (marketType === 'SPREAD') {
      if (lower.includes('home') || lower === 'h') return 'home';
      if (lower.includes('away') || lower === 'a') return 'away';
    }

    return selection;
  }

  /**
   * Normalize team names for matching across sources
   */
  normalizeTeamName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove special chars
      .replace(/city$/i, '') // Remove common suffixes
      .replace(/fc$/i, '')
      .replace(/sc$/i, '')
      .trim();
  }

  /**
   * Convert between odds formats
   */
  convertOdds(
    odds: number,
    from: 'american' | 'decimal' | 'fractional',
    to: 'american' | 'decimal' | 'fractional'
  ): number {
    if (from === to) return odds;

    // First convert to decimal
    let decimal: number;
    if (from === 'american') {
      decimal = americanToDecimal(odds);
    } else if (from === 'fractional') {
      decimal = odds + 1; // Fractional already represents the multiplier
    } else {
      decimal = odds;
    }

    // Then convert to target format
    if (to === 'decimal') return decimal;
    if (to === 'american') return decimalToAmerican(decimal);
    if (to === 'fractional') return decimal - 1;

    return odds;
  }
}
