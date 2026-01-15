'use client';

import { useState, Fragment } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Calculator, ChevronDown, ChevronUp, ExternalLink, RefreshCw } from 'lucide-react';
import { formatAmericanOdds, formatPercent } from '@arbedge/shared';
import { BetCalculator } from './bet-calculator';
import { useArbitrage } from '@/hooks/use-api';

interface Arbitrage {
  id: string;
  eventName: string;
  sportName: string;
  leagueName: string;
  marketType: string;
  profitPercent: number;
  confidence: number;
  detectedAt: string;
  eventStartTime: string;
  isLive: boolean;
  legs: {
    id: string;
    sportsbookId: string;
    sportsbookName: string;
    selection: string;
    price: number;
    decimalPrice: number;
    stakePercent: number;
  }[];
}

export function ArbitrageTable() {
  const { data, isLoading, error, refetch } = useArbitrage();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [calculatorArb, setCalculatorArb] = useState<Arbitrage | null>(null);

  const arbitrages: Arbitrage[] = data?.arbitrages || [];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-500';
    if (confidence >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Active Opportunities</span>
            <Skeleton className="h-5 w-20" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Failed to load arbitrage opportunities</p>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Active Opportunities</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Badge variant="outline">{arbitrages.length} found</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {arbitrages.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p className="mb-2">No arbitrage opportunities found</p>
              <p className="text-sm">Check back soon - opportunities are detected in real-time</p>
            </div>
          ) : (
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
                {arbitrages.map((arb) => (
                  <Fragment key={arb.id}>
                    <TableRow
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
                            {arb.leagueName} - {arb.sportName}
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
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          )}
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
