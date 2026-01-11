import { z } from 'zod';
import type { MarketType } from './odds';

export const ArbitrageStatusSchema = z.enum([
  'ACTIVE',
  'EXPIRED',
  'EXECUTED',
  'INVALID',
]);
export type ArbitrageStatus = z.infer<typeof ArbitrageStatusSchema>;

export interface ArbitrageLeg {
  id: string;
  sportsbookId: string;
  sportsbookName: string;
  sportsbookLogo?: string;
  selection: string;
  price: number; // American odds
  decimalPrice: number;
  line?: number;
  stakePercent: number; // Percentage of total stake (0-100)
  stakeAmount?: number; // Calculated stake amount
  potentialPayout?: number;
}

export interface Arbitrage {
  id: string;
  eventId: string;
  eventName: string; // e.g., "Kansas City Chiefs vs Baltimore Ravens"
  sportName: string;
  leagueName: string;
  marketType: MarketType;
  marketDescription?: string;
  profitPercent: number; // e.g., 2.5 for 2.5% profit
  confidence: number; // 0-100 confidence score
  status: ArbitrageStatus;
  detectedAt: Date;
  expiresAt?: Date;
  legs: ArbitrageLeg[];
  eventStartTime: Date;
  isLive: boolean;
}

export interface ArbitrageFilter {
  minProfit?: number;
  maxProfit?: number;
  minConfidence?: number;
  sports?: string[];
  sportsbooks?: string[];
  marketTypes?: MarketType[];
  includeLive?: boolean;
}

export interface ArbitrageCalculation {
  totalStake: number;
  guaranteedProfit: number;
  profitPercent: number;
  legs: {
    sportsbookId: string;
    stakeAmount: number;
    potentialPayout: number;
  }[];
}
