import { NextRequest } from 'next/server';

import { getAuthenticatedClient } from '@/lib/services/client-auth';

export interface ClientDashboardStats {
  activeProjects: number;
  averageProgress: number;
  pendingPayments: number;
  releasedDeliverables: number;
  unreadMessages: number;
  unreadNotifications: number;
}

export interface ClientDashboardProject {
  id: string;
  title: string;
  service: string;
  stage: string;
  progress: number;
  consultant: string;
  lastUpdated: string;
}

export interface ClientDashboardData {
  clientName: string;
  stats: ClientDashboardStats;
  recentProjects: ClientDashboardProject[];
}

interface ProjectRecord {
  id: string;
  project_reference: string;
  project_title: string;
  approved_service: string;
  status: string;
  completion_percentage: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

function getFirstName(
  fullName: string | null | undefined
): string {
  const normalizedName = fullName?.trim();

  if (!normalizedName) {
    return 'Client';
  }

  return normalizedName.split(/\s+/)[0];
}

function normalizeProgress(value: number | null): number {
  const progress = Number(value ?? 0);

  if (!Number.isFinite(progress)) {
    return 0;
  }

  return Math.min(Math.max(Math.round(progress), 0), 100);
}

function isCompletedProject(project: ProjectRecord): boolean {
  const normalizedStatus = project.status
    .trim()
    .toLowerCase();

  return (
    project.completed_at !== null ||
    normalizeProgress(project.completion_percentage) >= 100 ||
    normalizedStatus.includes('complete') ||
    normalizedStatus.includes('delivered') ||
    normalizedStatus.includes('closed')
  );
}

function formatService(value: string): string {
  const normalizedValue = value
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();

  if (!normalizedValue) {
    return 'Academic Support';
  }

  return normalizedValue.replace(/\b\w/g, (character) =>
    character.toUpperCase()
  );
}

function formatStatus(value: string): string {
  const normalizedValue = value
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();

  if (!normalizedValue) {
    return 'Not Started';
  }

  return normalizedValue.replace(/\b\w/g, (character) =>
    character.toUpperCase()
  );
}

function formatLastUpdated(value: string): string {
  const updatedDate = new Date(value);

  if (Number.isNaN(updatedDate.getTime())) {
    return 'Not available';
  }

  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const comparisonDate = new Date(
    updatedDate.getFullYear(),
    updatedDate.getMonth(),
    updatedDate.getDate()
  );

  const differenceInDays = Math.floor(
    (today.getTime() - comparisonDate.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (differenceInDays === 0) {
    return 'Today';
  }

  if (differenceInDays === 1) {
    return 'Yesterday';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(updatedDate);
}

function mapDashboardProject(
  project: ProjectRecord
): ClientDashboardProject {
  return {
    id: project.project_reference || project.id,
    title: project.project_title || 'Untitled Project',
    service: formatService(project.approved_service),
    stage: formatStatus(project.status),
    progress: normalizeProgress(
      project.completion_percentage
    ),
    consultant: 'JUSTmyTHESIS Team',
    lastUpdated: formatLastUpdated(
      project.updated_at || project.created_at
    ),
  };
}

export async function getClientDashboard(
  request: NextRequest
): Promise<ClientDashboardData> {
  const { admin, client } =
    await getAuthenticatedClient(request);

  const [
    projectsResult,
    unreadNotificationsResult,
  ] = await Promise.all([
    admin
      .from('projects')
      .select(
        `
          id,
          project_reference,
          project_title,
          approved_service,
          status,
          completion_percentage,
          completed_at,
          created_at,
          updated_at,
          archived_at
        `
      )
      .eq('client_id', client.id)
      .is('archived_at', null)
      .order('updated_at', { ascending: false }),

    admin
      .from('notifications')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .eq('client_id', client.id)
      .eq('is_read', false),
  ]);

  if (projectsResult.error) {
    throw new Error(projectsResult.error.message);
  }

  if (unreadNotificationsResult.error) {
    throw new Error(
      unreadNotificationsResult.error.message
    );
  }

  const projects =
    (projectsResult.data ?? []) as ProjectRecord[];

  const activeProjects = projects.filter(
    (project) => !isCompletedProject(project)
  );

  const averageProgress =
    activeProjects.length === 0
      ? 0
      : Math.round(
          activeProjects.reduce(
            (total, project) =>
              total +
              normalizeProgress(
                project.completion_percentage
              ),
            0
          ) / activeProjects.length
        );

  return {
    clientName: getFirstName(client.full_name),
    stats: {
      activeProjects: activeProjects.length,
      averageProgress,
      pendingPayments: 0,
      releasedDeliverables: 0,
      unreadMessages: 0,
      unreadNotifications:
        unreadNotificationsResult.count ?? 0,
    },
    recentProjects: projects
      .slice(0, 5)
      .map(mapDashboardProject),
  };
}