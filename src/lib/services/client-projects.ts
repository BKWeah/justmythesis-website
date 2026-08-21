import { NextRequest } from 'next/server';

import { getAuthenticatedClient } from '@/lib/services/client-auth';

export interface ClientProjectTimelineEvent {
  id: string;
  action: string;
  description: string;
  createdAt: string;
}

export interface ClientProjectDetail {
  id: string;
  projectReference: string;
  title: string;
  service: string;
  status: string;
  progress: number;
  startDate: string;
  expectedDeliveryDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  timeline: ClientProjectTimelineEvent[];
}

interface ProjectRecord {
  id: string;
  project_reference: string;
  project_title: string;
  approved_service: string;
  status: string;
  completion_percentage: number | null;
  start_date: string;
  expected_delivery_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ActivityRecord {
  id: string;
  action: string;
  description: string;
  created_at: string;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const CLIENT_SAFE_TIMELINE_ACTIONS = [
  'project_created',
  'project_updated',
  'project_completed',
  'milestone_added',
  'milestone_completed',
  'deliverable_released',
  'deliverable_confirmed',
] as const;

function normalizeProgress(value: number | null): number {
  const progress = Number(value ?? 0);

  if (!Number.isFinite(progress)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(progress)));
}

function formatLabel(value: string | null | undefined): string {
  const normalizedValue = value
    ?.replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();

  if (!normalizedValue) {
    return 'Not available';
  }

  return normalizedValue.replace(/\b\w/g, (character) =>
    character.toUpperCase()
  );
}

function mapProject(
  project: ProjectRecord,
  timeline: ClientProjectTimelineEvent[]
): ClientProjectDetail {
  return {
    id: project.id,
    projectReference: project.project_reference || project.id,
    title: project.project_title || 'Untitled Academic Project',
    service: formatLabel(project.approved_service),
    status: formatLabel(project.status),
    progress: normalizeProgress(project.completion_percentage),
    startDate: project.start_date,
    expectedDeliveryDate: project.expected_delivery_date,
    completedAt: project.completed_at,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    timeline,
  };
}

export async function getClientProjectDetail(
  request: NextRequest,
  identifier: string
): Promise<ClientProjectDetail | null> {
  const normalizedIdentifier = identifier.trim();

  if (!normalizedIdentifier) {
    return null;
  }

  const { admin, client } = await getAuthenticatedClient(request);

  let query = admin
    .from('projects')
    .select(
      `
        id,
        project_reference,
        project_title,
        approved_service,
        status,
        completion_percentage,
        start_date,
        expected_delivery_date,
        completed_at,
        created_at,
        updated_at
      `
    )
    .eq('client_id', client.id)
    .is('archived_at', null);

  query = UUID_PATTERN.test(normalizedIdentifier)
    ? query.eq('id', normalizedIdentifier)
    : query.eq('project_reference', normalizedIdentifier);

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const project = data as ProjectRecord;

  const { data: activityRows, error: activityError } = await admin
    .from('activity_logs')
    .select('id, action, description, created_at')
    .eq('project_id', project.id)
    .in('action', [...CLIENT_SAFE_TIMELINE_ACTIONS])
    .order('created_at', { ascending: false });

  if (activityError) {
    throw new Error(activityError.message);
  }

  const timeline = ((activityRows || []) as ActivityRecord[]).map(
    (activity) => ({
      id: activity.id,
      action: activity.action,
      description: activity.description,
      createdAt: activity.created_at,
    })
  );

  return mapProject(project, timeline);
}
