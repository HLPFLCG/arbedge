import type { Sportsbook } from '../types/sportsbook';

export const SPORTSBOOKS: Sportsbook[] = [
  {
    id: 'draftkings',
    name: 'DraftKings',
    slug: 'draftkings',
    logo: '/sportsbooks/draftkings.svg',
    isActive: true,
    tier: 1,
    states: ['AZ', 'CO', 'CT', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'MA', 'MD', 'MI', 'NH', 'NJ', 'NY', 'OH', 'OR', 'PA', 'TN', 'VA', 'WV', 'WY'],
    website: 'https://sportsbook.draftkings.com',
  },
  {
    id: 'fanduel',
    name: 'FanDuel',
    slug: 'fanduel',
    logo: '/sportsbooks/fanduel.svg',
    isActive: true,
    tier: 1,
    states: ['AZ', 'CO', 'CT', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'MA', 'MD', 'MI', 'NH', 'NJ', 'NY', 'OH', 'PA', 'TN', 'VA', 'WV', 'WY'],
    website: 'https://sportsbook.fanduel.com',
  },
  {
    id: 'betmgm',
    name: 'BetMGM',
    slug: 'betmgm',
    logo: '/sportsbooks/betmgm.svg',
    isActive: true,
    tier: 1,
    states: ['AZ', 'CO', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'MA', 'MD', 'MI', 'NJ', 'NY', 'OH', 'PA', 'TN', 'VA', 'WV', 'WY'],
    website: 'https://sports.betmgm.com',
  },
  {
    id: 'caesars',
    name: 'Caesars',
    slug: 'caesars',
    logo: '/sportsbooks/caesars.svg',
    isActive: true,
    tier: 1,
    states: ['AZ', 'CO', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'MA', 'MD', 'MI', 'NJ', 'NY', 'OH', 'PA', 'TN', 'VA', 'WV', 'WY'],
    website: 'https://www.caesars.com/sportsbook-and-casino',
  },
  {
    id: 'espnbet',
    name: 'ESPN BET',
    slug: 'espnbet',
    logo: '/sportsbooks/espnbet.svg',
    isActive: true,
    tier: 1,
    states: ['AZ', 'CO', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'MA', 'MD', 'MI', 'NJ', 'OH', 'PA', 'TN', 'VA', 'WV'],
    website: 'https://espnbet.com',
  },
];

export const SPORTSBOOK_BY_ID = SPORTSBOOKS.reduce(
  (acc, sb) => {
    acc[sb.id] = sb;
    return acc;
  },
  {} as Record<string, Sportsbook>
);

export const TIER_1_SPORTSBOOKS = SPORTSBOOKS.filter((sb) => sb.tier === 1);
