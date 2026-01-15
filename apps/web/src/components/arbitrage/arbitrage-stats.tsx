'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Clock, Target, DollarSign } from 'lucide-react';
import { useArbitrage } from '@/hooks/use-api';

export function ArbitrageStats() {
  const { data, isLoading } = useArbitrage();

  const stats = [
    {
      title: 'Active Opportunities',
      value: isLoading ? '...' : String(data?.stats?.activeCount || 0),
      change: `${data?.stats?.last24hCount || 0} in last 24h`,
      icon: TrendingUp,
      color: 'text-profit',
    },
    {
      title: 'Avg. Profit',
      value: isLoading ? '...' : `${(data?.stats?.avgProfit || 0).toFixed(1)}%`,
      change: 'Per arbitrage',
      icon: DollarSign,
      color: 'text-primary',
    },
    {
      title: 'Best Profit',
      value: isLoading ? '...' : `${(data?.stats?.maxProfit || 0).toFixed(1)}%`,
      change: 'Current best',
      icon: Target,
      color: 'text-green-500',
    },
    {
      title: 'Last Update',
      value: 'Just now',
      change: 'Real-time',
      icon: Clock,
      color: 'text-muted-foreground',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
