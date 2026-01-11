import { z } from 'zod';

export const SubscriptionTierSchema = z.enum([
  'FREE',
  'STARTER',
  'PROFESSIONAL',
  'ENTERPRISE',
]);
export type SubscriptionTier = z.infer<typeof SubscriptionTierSchema>;

export const SubscriptionStatusSchema = z.enum([
  'ACTIVE',
  'PAST_DUE',
  'CANCELED',
  'TRIALING',
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
}

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  limits: {
    maxSportsbooks: number;
    includesLiveArbs: boolean;
    includesAlerts: boolean;
    includesApiAccess: boolean;
    maxSeats: number;
  };
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    tier: 'STARTER',
    name: 'Starter',
    description: 'Perfect for learning arbitrage betting',
    priceMonthly: 99,
    priceYearly: 948, // $79/mo
    features: [
      'Pre-match arbitrage opportunities',
      'Up to 5 sportsbooks',
      'Basic confidence scoring',
      'Email support',
    ],
    limits: {
      maxSportsbooks: 5,
      includesLiveArbs: false,
      includesAlerts: false,
      includesApiAccess: false,
      maxSeats: 1,
    },
  },
  {
    tier: 'PROFESSIONAL',
    name: 'Professional',
    description: 'For active arbitrage professionals',
    priceMonthly: 249,
    priceYearly: 2388, // $199/mo
    features: [
      'Live & pre-match arbitrage',
      'All sportsbooks (50+)',
      'Advanced confidence scoring',
      'Real-time alerts (Discord, Telegram)',
      'Portfolio management',
      'Account health intelligence',
      'Priority support',
    ],
    limits: {
      maxSportsbooks: 999,
      includesLiveArbs: true,
      includesAlerts: true,
      includesApiAccess: false,
      maxSeats: 1,
    },
  },
  {
    tier: 'ENTERPRISE',
    name: 'Enterprise',
    description: 'For syndicates and betting funds',
    priceMonthly: 499,
    priceYearly: 4788, // $399/mo
    features: [
      'Everything in Professional',
      'API access',
      'Multi-seat (up to 5 users)',
      'Custom integrations',
      'Dedicated support',
      'Priority alert delivery',
    ],
    limits: {
      maxSportsbooks: 999,
      includesLiveArbs: true,
      includesAlerts: true,
      includesApiAccess: true,
      maxSeats: 5,
    },
  },
];
