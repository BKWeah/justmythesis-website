'use client';

import { useState, useEffect, useCallback } from 'react';

export interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  activeProjects: number;
  completedProjects: number;
}

export interface RecentRequest {
  id: string;
  request_reference: string;
  working_title: string | null;
  status: string;
  priority: string;
  created_at: string;
  client: {
    full_name: string;
    email: string;
  } | null;
}

export interface AttentionProject {
  id: string;
  project_reference: string;
  project_title: string;
  status: string;
  completion_percentage: number;
  expected_delivery_date: string | null;
  client: {
    full_name: string;
    email: string;
  } | null;
}

export interface DashboardData {
  stats: DashboardStats;
  recentRequests: RecentRequest[];
  attentionProjects: AttentionProject[];
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard');

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}