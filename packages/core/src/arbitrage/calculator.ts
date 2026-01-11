import Decimal from 'decimal.js';
import type { ArbitrageLeg } from './detector';

export interface StakeCalculation {
  totalStake: number;
  guaranteedProfit: number;
  profitPercent: number;
  legs: LegStake[];
}

export interface LegStake {
  sportsbookId: string;
  sportsbookName: string;
  selection: string;
  stakeAmount: number;
  potentialPayout: number;
  odds: number;
  decimalOdds: number;
}

export class ArbitrageCalculator {
  /**
   * Calculate optimal stakes for an arbitrage opportunity
   */
  calculateStakes(totalStake: number, legs: ArbitrageLeg[]): StakeCalculation {
    if (legs.length < 2) {
      throw new Error('Arbitrage requires at least 2 legs');
    }

    // Calculate total implied probability
    const totalImplied = legs.reduce(
      (sum, leg) => sum.plus(new Decimal(1).div(leg.decimalPrice)),
      new Decimal(0)
    );

    // Calculate stake for each leg
    const legStakes: LegStake[] = legs.map((leg) => {
      const impliedProb = new Decimal(1).div(leg.decimalPrice);
      const stakeAmount = new Decimal(totalStake)
        .times(impliedProb)
        .div(totalImplied)
        .toDecimalPlaces(2)
        .toNumber();

      const potentialPayout = new Decimal(stakeAmount)
        .times(leg.decimalPrice)
        .toDecimalPlaces(2)
        .toNumber();

      return {
        sportsbookId: leg.sportsbookId,
        sportsbookName: leg.sportsbookName,
        selection: leg.selection,
        stakeAmount,
        potentialPayout,
        odds: leg.price,
        decimalOdds: leg.decimalPrice,
      };
    });

    // All payouts should be equal (guaranteed profit)
    const guaranteedPayout = legStakes[0].potentialPayout;
    const guaranteedProfit = new Decimal(guaranteedPayout)
      .minus(totalStake)
      .toDecimalPlaces(2)
      .toNumber();

    const profitPercent = new Decimal(guaranteedProfit)
      .div(totalStake)
      .times(100)
      .toDecimalPlaces(2)
      .toNumber();

    return {
      totalStake,
      guaranteedProfit,
      profitPercent,
      legs: legStakes,
    };
  }

  /**
   * Calculate the ROI for a given arbitrage
   */
  calculateROI(profitPercent: number, tradesPerDay: number): {
    dailyROI: number;
    monthlyROI: number;
    annualROI: number;
  } {
    const dailyROI = profitPercent * tradesPerDay;
    const monthlyROI = dailyROI * 30;
    const annualROI = dailyROI * 365;

    return {
      dailyROI: Math.round(dailyROI * 100) / 100,
      monthlyROI: Math.round(monthlyROI * 100) / 100,
      annualROI: Math.round(annualROI * 100) / 100,
    };
  }

  /**
   * Adjust stakes for rounding to avoid fractional cents
   */
  roundStakes(
    legStakes: LegStake[],
    roundTo: number = 1 // Round to nearest dollar by default
  ): LegStake[] {
    return legStakes.map((leg) => ({
      ...leg,
      stakeAmount: Math.round(leg.stakeAmount / roundTo) * roundTo,
      potentialPayout: Math.round((leg.stakeAmount / roundTo) * roundTo * leg.decimalOdds * 100) / 100,
    }));
  }

  /**
   * Check if a sportsbook has minimum bet requirements
   */
  meetsMinimumBet(stakeAmount: number, minimumBet: number = 1): boolean {
    return stakeAmount >= minimumBet;
  }
}
