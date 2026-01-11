export const runtime = 'edge';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, BarChart3, Plus } from 'lucide-react';

export default function PortfolioPage() {
  // Mock portfolio data
  const portfolio = {
    totalBankroll: 25000,
    todayPnL: 342.50,
    weekPnL: 1247.80,
    monthPnL: 4521.30,
    totalBets: 156,
    winRate: 98.7,
    averageProfit: 2.3,
  };

  const recentBets = [
    {
      id: '1',
      event: 'Chiefs @ Ravens',
      date: new Date(Date.now() - 3600000),
      stake: 500,
      profit: 14.50,
      status: 'won',
    },
    {
      id: '2',
      event: 'Lakers @ Celtics',
      date: new Date(Date.now() - 7200000),
      stake: 750,
      profit: 17.25,
      status: 'won',
    },
    {
      id: '3',
      event: 'Yankees @ Red Sox',
      date: new Date(Date.now() - 10800000),
      stake: 400,
      profit: 12.80,
      status: 'won',
    },
    {
      id: '4',
      event: 'Rangers @ Bruins',
      date: new Date(Date.now() - 14400000),
      stake: 600,
      profit: -5.00,
      status: 'void',
    },
  ];

  const accountBalances = [
    { name: 'DraftKings', balance: 5234.50, status: 'active' },
    { name: 'FanDuel', balance: 4891.20, status: 'active' },
    { name: 'BetMGM', balance: 6123.80, status: 'active' },
    { name: 'Caesars', balance: 4512.30, status: 'limited' },
    { name: 'ESPN BET', balance: 4238.20, status: 'active' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground mt-1">Track your bankroll and performance</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bankroll</p>
                <p className="text-2xl font-bold mt-1">
                  ${portfolio.totalBankroll.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <PiggyBank className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today&apos;s P&L</p>
                <p className="text-2xl font-bold mt-1 text-profit">
                  +${portfolio.todayPnL.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-profit/10 text-profit">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold mt-1 text-profit">
                  +${portfolio.weekPnL.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-profit/10 text-profit">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold mt-1 text-profit">
                  +${portfolio.monthPnL.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-profit/10 text-profit">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Balances */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sportsbook Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {accountBalances.map((account) => (
                <div
                  key={account.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold">{account.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <Badge
                        variant={account.status === 'active' ? 'default' : 'warning'}
                        className="text-xs"
                      >
                        {account.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="font-mono font-bold">${account.balance.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBets.map((bet) => (
                <div
                  key={bet.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{bet.event}</p>
                    <p className="text-xs text-muted-foreground">
                      Stake: ${bet.stake} • {bet.date.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-mono font-bold ${
                        bet.profit > 0 ? 'text-profit' : bet.profit < 0 ? 'text-loss' : ''
                      }`}
                    >
                      {bet.profit > 0 ? '+' : ''}${bet.profit.toFixed(2)}
                    </p>
                    <Badge variant={bet.status === 'won' ? 'profit' : 'secondary'} className="text-xs">
                      {bet.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
