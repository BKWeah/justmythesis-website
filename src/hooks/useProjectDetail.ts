'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Milestone {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  completed_date: string | null;
}

export interface TeamMember {
  id: string;
  staff_id: string;
  staff_name: string;
  staff_email: string;
  staff_role: string;
  role: string;
  assigned_date: string;
}

export interface ProjectDocument {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  public_url: string;
  category: string;
  description: string | null;
  created_at: string;
}

export interface QAReview {
  id: string;
  structure_review: string | null;
  formatting_review: string | null;
  citation_review: string | null;
  compliance_review: string | null;
  overall_status: string | null;
  reviewer_notes: string | null;
  created_at: string;
}

export interface Deliverable {
  id: string;
  version: number;
  file_name: string;
  file_type: string;
  file_size: number;
  public_url: string;
  description: string | null;
  is_final: boolean;
  client_confirmed: boolean;
  confirmed_at: string | null;
  created_at: string;
}

export interface Activity {
  id: string;
  action: string;
  description: string;
  performer_name: string;
  created_at: string;
}

export interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference: string;
  notes: string | null;
}

export interface ProjectDetail {
  id: string;
  project_reference: string;
  project_title: string;
  status: string;
  current_stage: string;
  start_date: string;
  expected_delivery_date: string | null;
  completed_at: string | null;
  clients: {
    id: string;
    full_name: string;
    email: string;
    institution: string;
  } | null;
  linked_request: {
    id: string;
    request_reference: string;
    working_title: string;
    status: string;
  } | null;
  team: TeamMember[];
  milestones: Milestone[];
  documents: ProjectDocument[];
  qa_review: QAReview | null;
  deliverables: Deliverable[];
  activities: Activity[];
  payments: Payment[];
}

export function useProjectDetail(projectId: string) {
  const [data, setData] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/projects/${projectId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Project not found');
        }
        throw new Error('Failed to fetch project');
      }

      const result = await response.json();
      setData(result.project);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStage = async (stage: string) => {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_stage',
        data: { stage },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update stage');
    }

    await fetchData();
    return response.json();
  };

  const completeProject = async () => {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'complete',
        data: {},
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to complete project');
    }

    await fetchData();
    return response.json();
  };

  const archiveProject = async () => {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'archive',
        data: {},
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to archive project');
    }

    await fetchData();
    return response.json();
  };

  const addMilestone = async (milestone: { title: string; description?: string; due_date: string }) => {
    const response = await fetch(`/api/projects/${projectId}/milestones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(milestone),
    });

    if (!response.ok) {
      throw new Error('Failed to add milestone');
    }

    await fetchData();
    return response.json();
  };

  const completeMilestone = async (milestoneId: string) => {
    const response = await fetch(`/api/projects/${projectId}/milestones`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        milestoneId,
        action: 'complete',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to complete milestone');
    }

    await fetchData();
    return response.json();
  };

  const assignTeamMember = async (staffId: string, role: string) => {
    const response = await fetch(`/api/projects/${projectId}/team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffId, role }),
    });

    if (!response.ok) {
      throw new Error('Failed to assign team member');
    }

    await fetchData();
    return response.json();
  };

  const removeTeamMember = async (memberId: string) => {
    const response = await fetch(`/api/projects/${projectId}/team?memberId=${memberId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to remove team member');
    }

    await fetchData();
    return response.json();
  };

  const updateTeamRole = async (memberId: string, role: string) => {
    const response = await fetch(`/api/projects/${projectId}/team`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, role }),
    });

    if (!response.ok) {
      throw new Error('Failed to update team role');
    }

    await fetchData();
    return response.json();
  };

  const saveQAReview = async (review: {
    structure_review?: string;
    formatting_review?: string;
    citation_review?: string;
    compliance_review?: string;
    overall_status?: string;
    reviewer_notes?: string;
  }) => {
    const response = await fetch(`/api/projects/${projectId}/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });

    if (!response.ok) {
      throw new Error('Failed to save QA review');
    }

    await fetchData();
    return response.json();
  };

  const updateQAReview = async (status: string) => {
    const response = await fetch(`/api/projects/${projectId}/qa`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update QA review');
    }

    await fetchData();
    return response.json();
  };

  const confirmDeliverable = async (deliverableId: string, confirmed: boolean) => {
    const response = await fetch(`/api/projects/${projectId}/deliverables`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliverableId, clientConfirmed: confirmed }),
    });

    if (!response.ok) {
      throw new Error('Failed to update deliverable');
    }

    await fetchData();
    return response.json();
  };

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    updateStage,
    completeProject,
    archiveProject,
    addMilestone,
    completeMilestone,
    assignTeamMember,
    removeTeamMember,
    updateTeamRole,
    saveQAReview,
    updateQAReview,
    confirmDeliverable,
  };
}