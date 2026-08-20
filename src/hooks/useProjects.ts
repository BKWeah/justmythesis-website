'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ProjectClient {
  id: string;
  full_name: string;
  email: string;
  institution: string;
}

export interface ProjectStaff {
  id: string;
  staff_name: string;
  staff_email: string;
  staff_role: string;
  role: string;
  assigned_date: string;
}

export interface ProjectFilters {
  search: string;
  stage: string;
  status: string;
  staff: string;
  institution: string;
}

export function useProjects(filters: ProjectFilters) {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.stage) params.append('stage', filters.stage);
      if (filters.status) params.append('status', filters.status);
      if (filters.staff) params.append('staff', filters.staff);
      if (filters.institution) params.append('institution', filters.institution);

      const response = await fetch(`/api/projects?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      setProjects(data.projects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, isLoading, error, refetch: fetchProjects };
}