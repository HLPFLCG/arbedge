/**
 * Convert American odds to decimal odds
 */
export function americanToDecimal(american: number): number {
  if (american > 0) {
    return (american / 100) + 1;
  } else {
    return (100 / Math.abs(american)) + 1;
  }
}

/**
 * Convert decimal odds to American odds
 */
export function decimalToAmerican(decimal: number): number {
  if (decimal >= 2) {
    return Math.round((decimal - 1) * 100);
  } else {
    return Math.round(-100 / (decimal - 1));
  }
}

/**
 * Calculate implied probability from decimal odds
 */
export function impliedProbability(decimalOdds: number): number {
  return 1 / decimalOdds;
}

/**
 * Calculate the total implied probability (vig/overround)
 */
export function calculateOverround(decimalOdds: number[]): number {
  return decimalOdds.reduce((sum, odds) => sum + impliedProbability(odds), 0);
}

/**
 * Check if there's an arbitrage opportunity (overround < 1)
 */
export function hasArbitrageOpportunity(decimalOdds: number[]): boolean {
  return calculateOverround(decimalOdds) < 1;
}

/**
 * Calculate arbitrage profit percentage
 */
export function calculateArbitrageProfit(decimalOdds: number[]): number {
  const overround = calculateOverround(decimalOdds);
  if (overround >= 1) return 0;
  return ((1 - overround) / overround) * 100;
}

/**
 * Calculate optimal stake distribution for two-way arbitrage
 */
export function calculateTwoWayStakes(
  totalStake: number,
  decimal1: number,
  decimal2: number
): { stake1: number; stake2: number; profit: number } {
  const prob1 = impliedProbability(decimal1);
  const prob2 = impliedProbability(decimal2);
  const totalProb = prob1 + prob2;

  if (totalProb >= 1) {
    return { stake1: 0, stake2: 0, profit: 0 };
  }

  const stake1 = (totalStake * prob1) / totalProb;
  const stake2 = (totalStake * prob2) / totalProb;
  const payout = stake1 * decimal1; // Same as stake2 * decimal2
  const profit = payout - totalStake;

  return {
    stake1: Math.round(stake1 * 100) / 100,
    stake2: Math.round(stake2 * 100) / 100,
    profit: Math.round(profit * 100) / 100,
  };
}

/**
 * Calculate optimal stake distribution for three-way arbitrage
 */
export function calculateThreeWayStakes(
  totalStake: number,
  decimal1: number,
  decimal2: number,
  decimal3: number
): { stake1: number; stake2: number; stake3: number; profit: number } {
  const prob1 = impliedProbability(decimal1);
  const prob2 = impliedProbability(decimal2);
  const prob3 = impliedProbability(decimal3);
  const totalProb = prob1 + prob2 + prob3;

  if (totalProb >= 1) {
    return { stake1: 0, stake2: 0, stake3: 0, profit: 0 };
  }

  const stake1 = (totalStake * prob1) / totalProb;
  const stake2 = (totalStake * prob2) / totalProb;
  const stake3 = (totalStake * prob3) / totalProb;
  const payout = stake1 * decimal1;
  const profit = payout - totalStake;

  return {
    stake1: Math.round(stake1 * 100) / 100,
    stake2: Math.round(stake2 * 100) / 100,
    stake3: Math.round(stake3 * 100) / 100,
    profit: Math.round(profit * 100) / 100,
  };
}

/**
 * Kelly Criterion for optimal bet sizing
 */
export function kellyBetSize(
  bankroll: number,
  probability: number,
  decimalOdds: number,
  fraction: number = 0.25 // Quarter Kelly is safer
): number {
  const b = decimalOdds - 1;
  const q = 1 - probability;
  const kelly = (b * probability - q) / b;

  if (kelly <= 0) return 0;

  return Math.round(bankroll * kelly * fraction * 100) / 100;
}

/**
 * Calculate Closing Line Value (CLV)
 */
export function calculateCLV(openingOdds: number, closingOdds: number): number {
  const openingProb = impliedProbability(americanToDecimal(openingOdds));
  const closingProb = impliedProbability(americanToDecimal(closingOdds));
  return ((closingProb - openingProb) / openingProb) * 100;
}
