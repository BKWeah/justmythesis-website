'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

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
  approved_service: string;
  status: string;
    current_stage: string;
  completion_percentage: number;
  start_date: string;
  expected_delivery_date: string | null;
  completed_at: string | null;
  notes: string | null;
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

interface ProjectUpdateInput {
  status: string;
  completionPercentage: number;
  expectedDeliveryDate: string | null;
  notes: string;
}

export function useProjectDetail(projectId: string) {
  const [data, setData] =
    useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] =
    useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/projects/${projectId}`,
        {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Project not found');
        }

        throw new Error(
          result?.error || 'Failed to fetch project'
        );
      }

      setData(result.project);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'An error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const updateProject = async (
    updates: ProjectUpdateInput
  ) => {
    const response = await fetch(
      `/api/projects/${projectId}`,
      {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_project',
          data: updates,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error || 'Failed to update project'
      );
    }

    await fetchData();

    return result;
  };

  const updateStage = async (stage: string) => {
    const response = await fetch(
      `/api/projects/${projectId}`,
      {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_stage',
          data: { stage },
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error || 'Failed to update stage'
      );
    }

    await fetchData();

    return result;
  };

  const completeProject = async () => {
    const response = await fetch(
      `/api/projects/${projectId}`,
      {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'complete',
          data: {},
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error || 'Failed to complete project'
      );
    }

    await fetchData();

    return result;
  };

  const archiveProject = async () => {
    const response = await fetch(
      `/api/projects/${projectId}`,
      {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'archive',
          data: {},
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error || 'Failed to archive project'
      );
    }

    await fetchData();

    return result;
  };

  const addMilestone = async (milestone: {
    title: string;
    description?: string;
    due_date: string;
  }) => {
    const response = await fetch(
      `/api/projects/${projectId}/milestones`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(milestone),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error || 'Failed to add milestone'
      );
    }

    await fetchData();

    return result;
  };

  const completeMilestone = async (
    milestoneId: string
  ) => {
    const response = await fetch(
      `/api/projects/${projectId}/milestones`,
      {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          milestoneId,
          action: 'complete',
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error ||
          'Failed to complete milestone'
      );
    }

    await fetchData();

    return result;
  };

  const assignTeamMember = async (
    staffId: string,
    role: string
  ) => {
    const response = await fetch(
      `/api/projects/${projectId}/team`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staffId,
          role,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error ||
          'Failed to assign team member'
      );
    }

    await fetchData();

    return result;
  };

  const removeTeamMember = async (
    memberId: string
  ) => {
    const response = await fetch(
      `/api/projects/${projectId}/team?memberId=${encodeURIComponent(
        memberId
      )}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error ||
          'Failed to remove team member'
      );
    }

    await fetchData();

    return result;
  };

  const updateTeamRole = async (
    memberId: string,
    role: string
  ) => {
    const response = await fetch(
      `/api/projects/${projectId}/team`,
      {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId,
          role,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error ||
          'Failed to update team member'
      );
    }

    await fetchData();

    return result;
  };

  const saveQAReview = async (review: {
    structure_review?: string;
    formatting_review?: string;
    citation_review?: string;
    compliance_review?: string;
    overall_status?: string;
    reviewer_notes?: string;
  }) => {
    const response = await fetch(
      `/api/projects/${projectId}/qa`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(review),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error ||
          'Failed to save QA review'
      );
    }

    await fetchData();

    return result;
  };

  const updateQAReview = async (
    status: string
  ) => {
    const response = await fetch(
      `/api/projects/${projectId}/qa`,
      {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error ||
          'Failed to update QA review'
      );
    }

    await fetchData();

    return result;
  };

  const confirmDeliverable = async (
    deliverableId: string,
    confirmed: boolean
  ) => {
    const response = await fetch(
      `/api/projects/${projectId}/deliverables`,
      {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deliverableId,
          clientConfirmed: confirmed,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error ||
          'Failed to update deliverable'
      );
    }

    await fetchData();

    return result;
  };

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    updateProject,
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