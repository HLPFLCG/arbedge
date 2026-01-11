import { z } from 'zod';

export const OddsFormatSchema = z.enum(['american', 'decimal', 'fractional']);
export type OddsFormat = z.infer<typeof OddsFormatSchema>;

export const MarketTypeSchema = z.enum([
  'MONEYLINE',
  'SPREAD',
  'TOTAL',
  'PROP',
  'FUTURES',
]);
export type MarketType = z.infer<typeof MarketTypeSchema>;

export const EventStatusSchema = z.enum([
  'SCHEDULED',
  'LIVE',
  'COMPLETED',
  'CANCELED',
  'POSTPONED',
]);
export type EventStatus = z.infer<typeof EventStatusSchema>;

export interface Odds {
  id: string;
  marketId: string;
  sportsbookId: string;
  sportsbookName: string;
  selection: string;
  price: number; // American odds (-110, +150)
  decimalPrice: number; // Decimal odds (1.91, 2.50)
  line?: number; // Spread/total line (-3.5, 45.5)
  timestamp: Date;
  isLive: boolean;
}

export interface Market {
  id: string;
  eventId: string;
  type: MarketType;
  description?: string;
  period?: string; // 'full', '1H', '1Q', etc.
  odds: Odds[];
}

export interface Event {
  id: string;
  leagueId: string;
  leagueName: string;
  sportName: string;
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
  status: EventStatus;
  markets: Market[];
}

export interface OddsUpdate {
  sportsbookId: string;
  eventId: string;
  marketType: MarketType;
  selection: string;
  price: number;
  decimalPrice: number;
  line?: number;
  timestamp: number;
}
