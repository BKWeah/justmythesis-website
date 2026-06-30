'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Document {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  public_url: string;
  category: string;
  description: string | null;
  created_at: string;
}

export interface Note {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
}

export interface Activity {
  id: string;
  action: string;
  description: string;
  performer_name: string;
  created_at: string;
}

export interface Assessment {
  id: string;
  complexity: string | null;
  risk_level: string | null;
  strengths: string | null;
  weaknesses: string | null;
  missing_requirements: string | null;
  assessment_summary: string | null;
  created_at: string;
}

export interface Recommendation {
  id: string;
  recommended_service: string | null;
  timeline: string | null;
  estimated_cost: number | null;
  payment_structure: string | null;
  summary: string | null;
  is_draft: boolean;
  created_at: string;
}

export interface RequestDetail {
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
  clients: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    institution: string;
    programme: string | null;
    academic_level: string | null;
  } | null;
  staff: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  } | null;
  documents: Document[];
  notes: Note[];
  activities: Activity[];
  assessment: Assessment | null;
  recommendation: Recommendation | null;
}

export function useRequestDetail(requestId: string) {
  const [data, setData] = useState<RequestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/requests/${requestId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Request not found');
        }
        throw new Error('Failed to fetch request');
      }

      const result = await response.json();
      setData(result.request);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStatus = async (status: string) => {
    const response = await fetch(`/api/requests/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_status',
        data: { status },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update status');
    }

    await fetchData();
    return response.json();
  };

  const assignStaff = async (staffId: string) => {
    const response = await fetch(`/api/requests/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'assign_staff',
        data: { staffId },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to assign staff');
    }

    await fetchData();
    return response.json();
  };

  const saveAssessment = async (assessment: Partial<Assessment>) => {
    const response = await fetch(`/api/requests/${requestId}/assessment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessment),
    });

    if (!response.ok) {
      throw new Error('Failed to save assessment');
    }

    await fetchData();
    return response.json();
  };

  const updateAssessment = async (assessment: Partial<Assessment>) => {
    const response = await fetch(`/api/requests/${requestId}/assessment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessment),
    });

    if (!response.ok) {
      throw new Error('Failed to update assessment');
    }

    await fetchData();
    return response.json();
  };

  const saveRecommendation = async (recommendation: Partial<Recommendation>, isDraft: boolean) => {
    const response = await fetch(`/api/requests/${requestId}/recommendation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...recommendation, isDraft }),
    });

    if (!response.ok) {
      throw new Error('Failed to save recommendation');
    }

    await fetchData();
    return response.json();
  };

  const updateRecommendation = async (recommendation: Partial<Recommendation>, isDraft: boolean) => {
    const response = await fetch(`/api/requests/${requestId}/recommendation`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...recommendation, isDraft }),
    });

    if (!response.ok) {
      throw new Error('Failed to update recommendation');
    }

    await fetchData();
    return response.json();
  };

  const addNote = async (content: string) => {
    const response = await fetch(`/api/requests/${requestId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('Failed to add note');
    }

    await fetchData();
    return response.json();
  };

  const convertToProject = async (projectData: {
    project_title: string;
    start_date: string;
    deadline: string;
    service_package: string;
    payment_structure: string;
    estimated_cost: number;
  }) => {
    const response = await fetch(`/api/requests/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'convert_to_project',
        data: projectData,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to convert to project');
    }

    return response.json();
  };

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    updateStatus,
    assignStaff,
    saveAssessment,
    updateAssessment,
    saveRecommendation,
    updateRecommendation,
    addNote,
    convertToProject,
  };
}