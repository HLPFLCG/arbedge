import { z } from 'zod';
import type { SubscriptionTier } from './subscription';

export const AccountStatusSchema = z.enum([
  'ACTIVE',
  'LIMITED',
  'SUSPENDED',
  'CLOSED',
]);
export type AccountStatus = z.infer<typeof AccountStatusSchema>;

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  subscriptionTier: SubscriptionTier;
  createdAt: Date;
}

export interface SportsAccount {
  id: string;
  userId: string;
  sportsbookId: string;
  sportsbookName: string;
  username?: string;
  balance?: number;
  status: AccountStatus;
  averageCLV?: number; // Average Closing Line Value
  betCount?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CLVRecord {
  id: string;
  betId: string;
  sportsAccountId: string;
  openingOdds: number;
  closingOdds: number;
  clvPercent: number;
  recordedAt: Date;
}

export interface AccountHealthMetrics {
  sportsAccountId: string;
  sportsbookName: string;
  status: AccountStatus;
  totalBets: number;
  averageCLV: number;
  clvTrend: 'improving' | 'stable' | 'declining';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}
