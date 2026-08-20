'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Client {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  institution: string;
  programme: string | null;
  academic_level: string | null;
}

export interface Staff {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export interface SupportRequest {
  id: string;
  request_reference: string;
  working_title: string | null;
  requested_service: string;
  current_stage: string | null;
  academic_level: string | null;
  submission_deadline: string | null;
  status: string;
  priority: string;
  created_at: string;
  clients: Client | null;
}

export interface RequestFilters {
  search: string;
  status: string;
  priority: string;
  service: string;
  institution: string;
}

export function useRequests(filters: RequestFilters) {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.service) params.append('service', filters.service);
      if (filters.institution) params.append('institution', filters.institution);

      const response = await fetch(`/api/requests?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { requests, isLoading, error, refetch: fetchRequests };
}