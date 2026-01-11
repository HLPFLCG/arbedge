export const runtime = 'edge';

import { Suspense } from 'react';
import { ArbitrageTable } from '@/components/arbitrage/arbitrage-table';
import { ArbitrageFilters } from '@/components/arbitrage/arbitrage-filters';
import { ArbitrageStats } from '@/components/arbitrage/arbitrage-stats';
import { Skeleton } from '@/components/ui/skeleton';

export default function ArbitragePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Arbitrage Scanner</h1>
        <p className="text-muted-foreground mt-1">
          Real-time arbitrage opportunities across 50+ sportsbooks
        </p>
      </div>

      {/* Stats Overview */}
      <Suspense fallback={<StatsLoading />}>
        <ArbitrageStats />
      </Suspense>

      {/* Filters */}
      <ArbitrageFilters />

      {/* Arbitrage Table */}
      <Suspense fallback={<TableLoading />}>
        <ArbitrageTable />
      </Suspense>
    </div>
  );
}

function StatsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-lg" />
      ))}
    </div>
  );
}

function TableLoading() {
  return (
    <div className="border rounded-lg">
      <div className="p-4 border-b">
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="space-y-2 p-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}
