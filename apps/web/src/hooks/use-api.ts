'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseApiOptions<T> {
  initialData?: T;
  enabled?: boolean;
}

interface UseApiResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useApi<T>(
  url: string,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const { initialData, enabled = true } = options;
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch data');
      }
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [url, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// Specific hooks for different data types

export function useArbitrage(filters?: {
  sport?: string;
  minProfit?: number;
  minConfidence?: number;
  marketType?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.sport) params.set('sport', filters.sport);
  if (filters?.minProfit) params.set('minProfit', filters.minProfit.toString());
  if (filters?.minConfidence) params.set('minConfidence', filters.minConfidence.toString());
  if (filters?.marketType) params.set('marketType', filters.marketType);

  const url = `/api/arbitrage${params.toString() ? `?${params.toString()}` : ''}`;
  return useApi<{
    arbitrages: any[];
    stats: {
      activeCount: number;
      avgProfit: number;
      maxProfit: number;
      last24hCount: number;
    };
    pagination: { limit: number; offset: number; hasMore: boolean };
  }>(url);
}

export function usePortfolio() {
  return useApi<{
    portfolio: any;
    sportsAccounts: any[];
    recentBets: any[];
  }>('/api/portfolio');
}

export function useAlerts() {
  return useApi<{
    alerts: any[];
    recentLogs: any[];
  }>('/api/alerts');
}

export function useAccountHealth() {
  return useApi<{
    accounts: any[];
    summary: {
      totalAccounts: number;
      healthyAccounts: number;
      warningAccounts: number;
      atRiskAccounts: number;
      overallHealthScore: number;
    };
  }>('/api/account-health');
}

export function useUser() {
  return useApi<{ user: any }>('/api/user');
}

export function useSportsbooks() {
  return useApi<{ sportsbooks: any[] }>('/api/sportsbooks');
}
