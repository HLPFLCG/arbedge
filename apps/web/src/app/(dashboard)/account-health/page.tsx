export const runtime = 'edge';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Info,
} from 'lucide-react';

export default function AccountHealthPage() {
  const accounts = [
    {
      id: 'draftkings',
      name: 'DraftKings',
      status: 'healthy',
      clvAverage: 1.2,
      clvTrend: 'stable',
      totalBets: 87,
      riskLevel: 'low',
      recommendations: [],
    },
    {
      id: 'fanduel',
      name: 'FanDuel',
      status: 'healthy',
      clvAverage: 1.8,
      clvTrend: 'improving',
      totalBets: 92,
      riskLevel: 'low',
      recommendations: [],
    },
    {
      id: 'betmgm',
      name: 'BetMGM',
      status: 'warning',
      clvAverage: 3.5,
      clvTrend: 'declining',
      totalBets: 156,
      riskLevel: 'medium',
      recommendations: [
        'Consider reducing bet sizes by 20%',
        'Avoid betting immediately when odds are posted',
      ],
    },
    {
      id: 'caesars',
      name: 'Caesars',
      status: 'at_risk',
      clvAverage: 5.2,
      clvTrend: 'declining',
      totalBets: 203,
      riskLevel: 'high',
      recommendations: [
        'URGENT: This account is at high risk of being limited',
        'Reduce bet sizes significantly or use alternative accounts',
        'Mix in some recreational bets to appear less sharp',
      ],
    },
    {
      id: 'espnbet',
      name: 'ESPN BET',
      status: 'healthy',
      clvAverage: 0.8,
      clvTrend: 'stable',
      totalBets: 45,
      riskLevel: 'low',
      recommendations: [],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-profit bg-profit/10';
      case 'warning':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'at_risk':
        return 'text-loss bg-loss/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low':
        return <Badge variant="profit">Low Risk</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium Risk</Badge>;
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Account Health</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your sportsbook accounts to avoid limitations
        </p>
      </div>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold">What is CLV (Closing Line Value)?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                CLV measures how your bet odds compare to the closing line. Consistently positive
                CLV indicates you&apos;re beating the market, which sportsbooks may limit. We track
                this to help you manage account longevity.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Grid */}
      <div className="grid gap-4">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(account.status)}`}>
                    {account.status === 'healthy' && <Shield className="w-5 h-5" />}
                    {account.status === 'warning' && <AlertTriangle className="w-5 h-5" />}
                    {account.status === 'at_risk' && <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                    <CardDescription>{account.totalBets} bets tracked</CardDescription>
                  </div>
                </div>
                {getRiskBadge(account.riskLevel)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Avg. CLV</p>
                  <p className="text-xl font-bold">{account.clvAverage}%</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Trend</p>
                  <div className="flex items-center gap-1">
                    {account.clvTrend === 'improving' && (
                      <TrendingUp className="w-4 h-4 text-profit" />
                    )}
                    {account.clvTrend === 'declining' && (
                      <TrendingDown className="w-4 h-4 text-loss" />
                    )}
                    {account.clvTrend === 'stable' && (
                      <Activity className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="capitalize">{account.clvTrend}</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="capitalize font-medium">{account.status.replace('_', ' ')}</p>
                </div>
              </div>

              {account.recommendations.length > 0 && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Recommendations
                  </h4>
                  <ul className="space-y-1">
                    {account.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
