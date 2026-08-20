'use client';

import { useCallback, useEffect, useState } from 'react';

export interface Document {
  id: string;
  file_name: string;
  file_type?: string | null;
  file_size?: number | null;
  public_url?: string | null;
  category?: string | null;
  description?: string | null;
  created_at: string;
}

export interface Note {
  id: string;
  content: string;
  author_name?: string;
  created_at: string;
}

export interface Activity {
  id: string;
  action: string;
  description: string;
  performer_name?: string;
  created_at: string;
}

export type RiskLevel = 'Low' | 'Medium' | 'High';

export type AssessmentStatus = 'Draft' | 'Completed';

export interface Assessment {
  id: string;
  support_request_id: string;
  current_project_stage: string | null;
  completion_estimate: string | null;
  risk_level: RiskLevel | null;
  strengths: string | null;
  weaknesses: string | null;
  missing_requirements: string | null;
  compliance_issues: string | null;
  assessment_summary: string | null;
  status: AssessmentStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface AssessmentInput {
  current_project_stage?: string | null;
  completion_estimate?: string | null;
  risk_level?: RiskLevel | null;
  strengths?: string | null;
  weaknesses?: string | null;
  missing_requirements?: string | null;
  compliance_issues?: string | null;
  assessment_summary?: string | null;
  status?: AssessmentStatus;
}

export type RecommendationStatus =
  | 'Draft'
  | 'Approved Internally'
  | 'Sent to Client'
  | 'Accepted'
  | 'Rejected';

export interface Recommendation {
  id: string;
  support_request_id: string;
  recommended_service: string | null;
  recommended_timeline: string | null;
  recommended_fee: number | null;
  payment_structure: string | null;
  roadmap_summary: string | null;
  recommendation_summary: string | null;
  status: RecommendationStatus;
  client_feedback: string | null;
  client_decision_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface RecommendationInput {
  recommended_service?: string | null;
  recommended_timeline?: string | null;
  recommended_fee?: number | string | null;
  payment_structure?: string | null;
  roadmap_summary?: string | null;
  recommendation_summary?: string | null;
  status?: RecommendationStatus;
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
    whatsapp?: string | null;
    institution: string;
    programme: string | null;
    degree_level?: string | null;
    academic_level?: string | null;
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

interface ProjectConversionInput {
  project_title: string;
  start_date: string;
  deadline: string;
  service_package: string;
  payment_structure: string;
  estimated_cost: number;
}

async function readApiResponse<T>(response: Response): Promise<T> {
  let result: any = null;

  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok) {
    throw new Error(
      result?.error ||
        result?.message ||
        `Request failed with status ${response.status}`
    );
  }

  return result as T;
}

function resolveRecommendationStatus(
  statusOrIsDraft?: RecommendationStatus | boolean
): RecommendationStatus {
  if (typeof statusOrIsDraft === 'boolean') {
    return statusOrIsDraft ? 'Draft' : 'Sent to Client';
  }

  return statusOrIsDraft || 'Draft';
}

export function useRequestDetail(requestId: string) {
  const [data, setData] = useState<RequestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!requestId) {
      setData(null);
      setError('Request ID is missing');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'GET',
        cache: 'no-store',
      });

      const result = await readApiResponse<{
        request: RequestDetail;
      }>(response);

      setData(result.request);
    } catch (err) {
      setData(null);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load request details'
      );
    } finally {
      setIsLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStatus = useCallback(
    async (status: string) => {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_status',
          data: { status },
        }),
      });

      const result = await readApiResponse<{
        success: boolean;
        data?: unknown;
      }>(response);

      await fetchData();

      return result;
    },
    [requestId, fetchData]
  );

  const assignStaff = useCallback(
    async (staffId: string) => {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'assign_staff',
          data: { staffId },
        }),
      });

      const result = await readApiResponse<{
        success: boolean;
        data?: unknown;
      }>(response);

      await fetchData();

      return result;
    },
    [requestId, fetchData]
  );

  const saveAssessment = useCallback(
    async (assessment: AssessmentInput) => {
      const response = await fetch(
        `/api/requests/${requestId}/assessment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(assessment),
        }
      );

      const result = await readApiResponse<{
        success: boolean;
        assessment: Assessment;
      }>(response);

      await fetchData();

      return result;
    },
    [requestId, fetchData]
  );

  const updateAssessment = useCallback(
    async (assessment: AssessmentInput) => {
      const response = await fetch(
        `/api/requests/${requestId}/assessment`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(assessment),
        }
      );

      const result = await readApiResponse<{
        success: boolean;
        assessment: Assessment;
      }>(response);

      await fetchData();

      return result;
    },
    [requestId, fetchData]
  );

  const saveRecommendation = useCallback(
    async (
      recommendation: RecommendationInput,
      statusOrIsDraft?: RecommendationStatus | boolean
    ) => {
      const status = resolveRecommendationStatus(statusOrIsDraft);

      const response = await fetch(
        `/api/requests/${requestId}/recommendation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...recommendation,
            status: recommendation.status || status,
          }),
        }
      );

      const result = await readApiResponse<{
        success: boolean;
        recommendation: Recommendation;
      }>(response);

      await fetchData();

      return result;
    },
    [requestId, fetchData]
  );

  const updateRecommendation = useCallback(
    async (
      recommendation: RecommendationInput,
      statusOrIsDraft?: RecommendationStatus | boolean
    ) => {
      const status = resolveRecommendationStatus(statusOrIsDraft);

      const response = await fetch(
        `/api/requests/${requestId}/recommendation`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...recommendation,
            status: recommendation.status || status,
          }),
        }
      );

      const result = await readApiResponse<{
        success: boolean;
        recommendation: Recommendation;
      }>(response);

      await fetchData();

      return result;
    },
    [requestId, fetchData]
  );

  const addNote = useCallback(
    async (content: string) => {
      const response = await fetch(
        `/api/requests/${requestId}/notes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        }
      );

      const result = await readApiResponse<{
        success: boolean;
        note?: Note;
      }>(response);

      await fetchData();

      return result;
    },
    [requestId, fetchData]
  );

  const convertToProject = useCallback(
    async (projectData: ProjectConversionInput) => {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'convert_to_project',
          data: projectData,
        }),
      });

      return readApiResponse<{
        success: boolean;
        project?: {
          id: string;
          project_reference?: string;
        };
      }>(response);
    },
    [requestId]
  );

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