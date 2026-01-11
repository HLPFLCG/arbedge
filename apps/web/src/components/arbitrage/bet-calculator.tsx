'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatAmericanOdds, formatCurrency, formatPercent } from '@arbedge/shared';
import { calculateTwoWayStakes } from '@arbedge/shared';

interface ArbitrageLeg {
  id: string;
  sportsbookId: string;
  sportsbookName: string;
  selection: string;
  price: number;
  decimalPrice: number;
  stakePercent: number;
}

interface Arbitrage {
  id: string;
  eventName: string;
  profitPercent: number;
  legs: ArbitrageLeg[];
}

interface BetCalculatorProps {
  arbitrage: Arbitrage;
  onClose: () => void;
}

export function BetCalculator({ arbitrage, onClose }: BetCalculatorProps) {
  const [totalStake, setTotalStake] = useState(100);

  const calculation = useMemo(() => {
    if (arbitrage.legs.length !== 2) return null;

    const stakes = calculateTwoWayStakes(
      totalStake,
      arbitrage.legs[0].decimalPrice,
      arbitrage.legs[1].decimalPrice
    );

    return {
      stakes,
      leg1Stake: stakes.stake1,
      leg2Stake: stakes.stake2,
      guaranteedPayout: stakes.stake1 * arbitrage.legs[0].decimalPrice,
      profit: stakes.profit,
    };
  }, [totalStake, arbitrage]);

  const presets = [50, 100, 250, 500, 1000];

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bet Calculator</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Info */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{arbitrage.eventName}</p>
            <p className="text-2xl font-bold text-profit mt-1">
              +{formatPercent(arbitrage.profitPercent)} Profit
            </p>
          </div>

          <Separator />

          {/* Total Stake Input */}
          <div className="space-y-2">
            <Label htmlFor="stake">Total Stake</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="stake"
                  type="number"
                  value={totalStake}
                  onChange={(e) => setTotalStake(Number(e.target.value))}
                  className="pl-7 font-mono"
                  min={1}
                />
              </div>
            </div>
            <div className="flex gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset}
                  variant={totalStake === preset ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTotalStake(preset)}
                  className="flex-1"
                >
                  ${preset}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Stake Distribution */}
          {calculation && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Place These Bets:</h4>

              {arbitrage.legs.map((leg, index) => (
                <Card key={leg.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{leg.sportsbookName}</span>
                      <span className="text-2xl font-bold font-mono">
                        {formatCurrency(index === 0 ? calculation.leg1Stake : calculation.leg2Stake)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{leg.selection}</span>
                      <span className="font-mono">{formatAmericanOdds(leg.price)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Separator />

              {/* Results */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Stake:</span>
                  <span className="font-mono">{formatCurrency(totalStake)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Guaranteed Payout:</span>
                  <span className="font-mono">{formatCurrency(calculation.guaranteedPayout)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Guaranteed Profit:</span>
                  <span className="text-profit">{formatCurrency(calculation.profit)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
            <Button className="flex-1">Copy Stakes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
