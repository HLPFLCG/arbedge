'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Clock, Target, DollarSign } from 'lucide-react';

export function ArbitrageStats() {
  // In production, this would fetch real data
  const stats = [
    {
      title: 'Active Opportunities',
      value: '24',
      change: '+5 from last hour',
      icon: TrendingUp,
      color: 'text-profit',
    },
    {
      title: 'Avg. Profit',
      value: '2.3%',
      change: 'Per arbitrage',
      icon: DollarSign,
      color: 'text-primary',
    },
    {
      title: 'Avg. Confidence',
      value: '87',
      change: 'High quality',
      icon: Target,
      color: 'text-green-500',
    },
    {
      title: 'Last Update',
      value: '2s ago',
      change: 'Real-time',
      icon: Clock,
      color: 'text-muted-foreground',
    },
  ];

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
