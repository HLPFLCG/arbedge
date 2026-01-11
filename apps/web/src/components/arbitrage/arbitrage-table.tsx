'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { formatAmericanOdds, formatPercent } from '@arbedge/shared';
import { BetCalculator } from './bet-calculator';

// Mock data for demonstration
const mockArbitrages = [
  {
    id: '1',
    eventName: 'Kansas City Chiefs @ Baltimore Ravens',
    sportName: 'Football',
    leagueName: 'NFL',
    marketType: 'MONEYLINE' as const,
    profitPercent: 2.8,
    confidence: 92,
    detectedAt: new Date(Date.now() - 30000),
    eventStartTime: new Date(Date.now() + 3600000),
    isLive: false,
    legs: [
      {
        id: '1a',
        sportsbookId: 'draftkings',
        sportsbookName: 'DraftKings',
        selection: 'Chiefs ML',
        price: 145,
        decimalPrice: 2.45,
        stakePercent: 40.8,
      },
      {
        id: '1b',
        sportsbookId: 'fanduel',
        sportsbookName: 'FanDuel',
        selection: 'Ravens ML',
        price: -130,
        decimalPrice: 1.77,
        stakePercent: 59.2,
      },
    ],
  },
  {
    id: '2',
    eventName: 'Lakers @ Celtics',
    sportName: 'Basketball',
    leagueName: 'NBA',
    marketType: 'SPREAD' as const,
    profitPercent: 1.9,
    confidence: 85,
    detectedAt: new Date(Date.now() - 15000),
    eventStartTime: new Date(Date.now() + 7200000),
    isLive: false,
    legs: [
      {
        id: '2a',
        sportsbookId: 'betmgm',
        sportsbookName: 'BetMGM',
        selection: 'Lakers +4.5',
        price: -105,
        decimalPrice: 1.95,
        stakePercent: 51.3,
      },
      {
        id: '2b',
        sportsbookId: 'caesars',
        sportsbookName: 'Caesars',
        selection: 'Celtics -4.5',
        price: -105,
        decimalPrice: 1.95,
        stakePercent: 48.7,
      },
    ],
  },
  {
    id: '3',
    eventName: 'Yankees @ Red Sox',
    sportName: 'Baseball',
    leagueName: 'MLB',
    marketType: 'TOTAL' as const,
    profitPercent: 3.2,
    confidence: 78,
    detectedAt: new Date(Date.now() - 45000),
    eventStartTime: new Date(Date.now() + 5400000),
    isLive: false,
    legs: [
      {
        id: '3a',
        sportsbookId: 'espnbet',
        sportsbookName: 'ESPN BET',
        selection: 'Over 8.5',
        price: 110,
        decimalPrice: 2.1,
        stakePercent: 47.6,
      },
      {
        id: '3b',
        sportsbookId: 'draftkings',
        sportsbookName: 'DraftKings',
        selection: 'Under 8.5',
        price: 105,
        decimalPrice: 2.05,
        stakePercent: 52.4,
      },
    ],
  },
];

export function ArbitrageTable() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [calculatorArb, setCalculatorArb] = useState<typeof mockArbitrages[0] | null>(null);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-500';
    if (confidence >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Active Opportunities</span>
            <Badge variant="outline">{mockArbitrages.length} found</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Market</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-center">Confidence</TableHead>
                <TableHead>Detected</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockArbitrages.map((arb) => (
                <>
                  <TableRow
                    key={arb.id}
                    className="cursor-pointer"
                    onClick={() => setExpandedId(expandedId === arb.id ? null : arb.id)}
                  >
                    <TableCell>
                      {expandedId === arb.id ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{arb.eventName}</div>
                        <div className="text-xs text-muted-foreground">
                          {arb.leagueName} • {arb.sportName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{arb.marketType}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-profit font-bold text-lg">
                        +{formatPercent(arb.profitPercent)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`font-semibold ${getConfidenceColor(arb.confidence)}`}>
                        {arb.confidence}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {getTimeAgo(arb.detectedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCalculatorArb(arb);
                        }}
                      >
                        <Calculator className="w-4 h-4 mr-1" />
                        Calculate
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedId === arb.id && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-muted/30 p-4">
                        <div className="grid grid-cols-2 gap-4">
                          {arb.legs.map((leg) => (
                            <div
                              key={leg.id}
                              className="p-4 rounded-lg bg-card border border-border"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold">{leg.sportsbookName}</span>
                                <Button size="sm" variant="ghost" asChild>
                                  <a href="#" target="_blank" rel="noopener">
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </Button>
                              </div>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Selection:</span>
                                  <span className="font-medium">{leg.selection}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Odds:</span>
                                  <span className="font-mono font-bold">
                                    {formatAmericanOdds(leg.price)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Stake %:</span>
                                  <span className="font-medium">
                                    {leg.stakePercent.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {calculatorArb && (
        <BetCalculator
          arbitrage={calculatorArb}
          onClose={() => setCalculatorArb(null)}
        />
      )}
    </>
  );
}
