'use client';

import {
  AlertCircle,
  ArrowLeft,
  FolderKanban,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button, Card } from '@/components/ui';

interface ClientProject {
  id: string;
  project_reference?: string | null;
  project_title?: string | null;
  service_type?: string | null;
  current_stage?: string | null;
  status?: string | null;
  progress?: number | null;
  progress_percentage?: number | null;
  updated_at?: string | null;
  created_at?: string | null;
}

interface ClientProjectsResponse {
  success?: boolean;
  projects?: ClientProject[];
  error?: string;
}

function clampProgress(value: unknown): number {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : 0;

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(parsed)));
}

function formatDate(value?: string | null): string {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getProjectReference(project: ClientProject): string {
  return project.project_reference?.trim() || project.id;
}

function getProjectTitle(project: ClientProject): string {
  return project.project_title?.trim() || 'Untitled Academic Project';
}

function getProjectService(project: ClientProject): string {
  return project.service_type?.trim() || 'Academic Support';
}

function getProjectStage(project: ClientProject): string {
  return (
    project.current_stage?.trim() ||
    project.status?.trim() ||
    'Project Received'
  );
}

function getProjectProgress(project: ClientProject): number {
  return clampProgress(
    project.progress_percentage ?? project.progress ?? 0
  );
}

export default function ClientProjectsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/client/projects', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
        },
      });

      const data = (await response.json()) as ClientProjectsResponse;

      if (response.status === 401) {
        router.replace('/client/login');
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.error || 'Unable to retrieve your projects.'
        );
      }

      setProjects(Array.isArray(data.projects) ? data.projects : []);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to retrieve your projects.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              My Projects
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              View and track all your academic projects.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/client/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Scholar Haven
          </Button>
        </div>

        {isLoading && (
          <Card variant="bordered" padding="lg" className="bg-white">
            <div className="flex min-h-52 flex-col items-center justify-center text-center">
              <LoaderCircle
                className="h-8 w-8 animate-spin text-brand-green"
                aria-hidden="true"
              />

              <h2 className="mt-4 text-lg font-semibold text-foreground">
                Loading your projects
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Please wait while we retrieve your academic work.
              </p>
            </div>
          </Card>
        )}

        {!isLoading && error && (
          <Card variant="bordered" padding="lg" className="bg-white">
            <div className="flex min-h-52 flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <AlertCircle
                  className="h-6 w-6 text-red-600"
                  aria-hidden="true"
                />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-foreground">
                We could not load your projects
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                {error}
              </p>

              <Button
                type="button"
                className="mt-5"
                onClick={() => void fetchProjects()}
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {!isLoading && !error && projects.length === 0 && (
          <Card variant="bordered" padding="lg" className="bg-white">
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green/10">
                <FolderKanban
                  className="h-7 w-7 text-brand-green"
                  aria-hidden="true"
                />
              </div>

              <h2 className="mt-5 text-xl font-semibold text-foreground">
                No projects available yet
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Your approved academic projects will appear here once they
                have been created and assigned to your client account.
              </p>

              <Button
                type="button"
                className="mt-6"
                onClick={() => router.push('/client/request-support')}
              >
                Start a New Request
              </Button>
            </div>
          </Card>
        )}

        {!isLoading && !error && projects.length > 0 && (
          <div className="space-y-5">
            {projects.map((project) => {
              const projectReference = getProjectReference(project);
              const progress = getProjectProgress(project);

              return (
                <Card
                  key={project.id}
                  variant="bordered"
                  padding="lg"
                  className="bg-white"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-green/10">
                        <FolderKanban
                          className="h-6 w-6 text-brand-green"
                          aria-hidden="true"
                        />
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {projectReference}
                        </p>

                        <h2 className="mt-1 text-lg font-semibold text-foreground">
                          {getProjectTitle(project)}
                        </h2>

                        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                          <span>{getProjectService(project)}</span>
                          <span>{getProjectStage(project)}</span>
                          <span>
                            Updated{' '}
                            {formatDate(
                              project.updated_at ?? project.created_at
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full lg:max-w-xs">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          Progress
                        </span>

                        <span className="text-sm font-semibold text-foreground">
                          {progress}%
                        </span>
                      </div>

                      <div
                        className="h-2 overflow-hidden rounded-full bg-gray-100"
                        role="progressbar"
                        aria-label={`${getProjectTitle(project)} progress`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={progress}
                      >
                        <div
                          className="h-full rounded-full bg-brand-green"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <Button
                        type="button"
                        className="mt-4 w-full"
                        onClick={() =>
                          router.push(
                            `/client/project/${encodeURIComponent(
                              projectReference
                            )}`
                          )
                        }
                      >
                        View Project
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
