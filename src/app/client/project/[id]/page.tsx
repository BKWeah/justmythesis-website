'use client';

import { ProjectMessages } from '@/components/dashboard/ProjectMessages';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  FolderKanban,
  LoaderCircle,
  PackageOpen,
  RefreshCw,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { Badge, Button, Card } from '@/components/ui';
import type { ClientProjectDetail } from '@/lib/services/client-projects';

interface ClientProjectDetailResponse {
  success?: boolean;
  project?: ClientProjectDetail;
  error?: string;
}

interface ClientDeliverable {
  id: string;
  fileName: string;
  fileType: string | null;
  fileSizeBytes: number | null;
  deliveryNotes: string | null;
  versionNumber: number;
  isFinal: boolean;
  releasedAt: string;
  clientConfirmed: boolean;
  clientConfirmedAt: string | null;
  createdAt: string;
}

interface ClientDeliverablesResponse {
  success?: boolean;
  deliverables?: ClientDeliverable[];
  error?: string;
}

interface ClientDownloadResponse {
  success?: boolean;
  fileName?: string;
  url?: string;
  expiresIn?: number;
  error?: string;
}

function formatDate(value: string | null): string {
  if (!value) return 'Not yet scheduled';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatFileSize(value: number | null): string {
  if (!value || value <= 0) return 'Size unavailable';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ClientProjectDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const projectIdentifier = decodeURIComponent(params.id);

  const [project, setProject] = useState<ClientProjectDetail | null>(null);
  const [deliverables, setDeliverables] = useState<ClientDeliverable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeliverablesLoading, setIsDeliverablesLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deliverablesError, setDeliverablesError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/client/projects/${encodeURIComponent(projectIdentifier)}`,
        {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        }
      );

      const data = (await response.json()) as ClientProjectDetailResponse;

      if (response.status === 401) {
        router.replace('/client/login');
        return;
      }

      if (!response.ok || !data.project) {
        throw new Error(data.error || 'Unable to retrieve this project.');
      }

      setProject(data.project);
    } catch (requestError) {
      setProject(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to retrieve this project.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectIdentifier, router]);

  const fetchDeliverables = useCallback(async () => {
    try {
      setIsDeliverablesLoading(true);
      setDeliverablesError(null);

      const response = await fetch(
        `/api/client/projects/${encodeURIComponent(projectIdentifier)}/deliverables`,
        {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        }
      );

      const data = (await response.json()) as ClientDeliverablesResponse;

      if (response.status === 401) {
        router.replace('/client/login');
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Unable to retrieve deliverables.');
      }

      setDeliverables(data.deliverables || []);
    } catch (requestError) {
      setDeliverables([]);
      setDeliverablesError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to retrieve deliverables.'
      );
    } finally {
      setIsDeliverablesLoading(false);
    }
  }, [projectIdentifier, router]);

  useEffect(() => {
    void fetchProject();
    void fetchDeliverables();
  }, [fetchDeliverables, fetchProject]);

  const handleDownload = async (deliverable: ClientDeliverable) => {
    try {
      setDownloadingId(deliverable.id);
      setDeliverablesError(null);

      const response = await fetch(
        `/api/client/projects/${encodeURIComponent(
          projectIdentifier
        )}/deliverables?deliverableId=${encodeURIComponent(deliverable.id)}`,
        {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        }
      );

      const data = (await response.json()) as ClientDownloadResponse;

      if (response.status === 401) {
        router.replace('/client/login');
        return;
      }

      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Unable to download this file.');
      }

      window.location.assign(data.url);
    } catch (requestError) {
      setDeliverablesError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to download this file.'
      );
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        <div className="flex justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/client/projects')}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to My Projects
          </Button>
        </div>

        {isLoading && (
          <Card variant="bordered" padding="lg" className="bg-white">
            <div className="flex min-h-72 flex-col items-center justify-center text-center">
              <LoaderCircle className="h-8 w-8 animate-spin text-brand-green" aria-hidden="true" />
              <h1 className="mt-4 text-xl font-semibold text-foreground">Loading project details</h1>
              <p className="mt-2 text-sm text-muted-foreground">Please wait while we retrieve your project.</p>
            </div>
          </Card>
        )}

        {!isLoading && error && (
          <Card variant="bordered" padding="lg" className="bg-white">
            <div className="flex min-h-72 flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <AlertCircle className="h-6 w-6 text-red-600" aria-hidden="true" />
              </div>
              <h1 className="mt-4 text-xl font-semibold text-foreground">We could not load this project</h1>
              <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{error}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button type="button" onClick={() => void fetchProject()}>
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Try Again
                </Button>
                <Button type="button" variant="secondary" onClick={() => router.push('/client/projects')}>
                  View My Projects
                </Button>
              </div>
            </div>
          </Card>
        )}

        {!isLoading && !error && project && (
          <>
            <Card variant="bordered" padding="lg" className="bg-white">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-green/10">
                    <FolderKanban className="h-6 w-6 text-brand-green" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-green">{project.projectReference}</p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">{project.title}</h1>
                    <p className="mt-2 text-sm text-muted-foreground">{project.service}</p>
                  </div>
                </div>
                <Badge>{project.status}</Badge>
              </div>
            </Card>

            <Card variant="bordered" padding="lg" className="bg-white">
              <h2 className="text-xl font-semibold text-foreground">Project Overview</h2>
              <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Project Status</p>
                  <p className="mt-2 font-semibold text-foreground">{project.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approved Service</p>
                  <p className="mt-2 font-semibold text-foreground">{project.service}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <div className="mt-2 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-brand-green" aria-hidden="true" />
                    <span className="font-semibold text-foreground">{formatDate(project.startDate)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Target Deadline</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-brand-green" aria-hidden="true" />
                    <span className="font-semibold text-foreground">{formatDate(project.expectedDeliveryDate)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="mt-2 font-semibold text-foreground">{formatDate(project.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completion</p>
                  <div className="mt-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-green" aria-hidden="true" />
                    <span className="font-semibold text-foreground">{project.progress}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Overall Progress</span>
                  <span className="font-semibold text-foreground">{project.progress}%</span>
                </div>
                <div
                  className="h-3 overflow-hidden rounded-full bg-gray-100"
                  role="progressbar"
                  aria-label={`${project.title} progress`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={project.progress}
                >
                  <div className="h-full rounded-full bg-brand-green" style={{ width: `${project.progress}%` }} />
                </div>
              </div>
            </Card>

            <Card variant="bordered" padding="lg" className="bg-white">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-green/10">
                  <Activity className="h-5 w-5 text-brand-green" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Project Timeline</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Key client-visible milestones and project updates.</p>
                </div>
              </div>

              {project.timeline.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
                  <p className="font-semibold text-foreground">No timeline updates yet</p>
                  <p className="mt-2 text-sm text-muted-foreground">Important project updates will appear here as work progresses.</p>
                </div>
              ) : (
                <div className="mt-6 space-y-0">
                  {project.timeline.map((event, index) => (
                    <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                      {index < project.timeline.length - 1 && (
                        <div className="absolute left-[7px] top-5 h-full w-px bg-gray-200" aria-hidden="true" />
                      )}
                      <div className="relative mt-1 h-4 w-4 shrink-0 rounded-full border-4 border-green-100 bg-brand-green" />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{event.description}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{formatDateTime(event.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card variant="bordered" padding="lg" className="bg-white">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Deliverables</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Download files released by the JUSTmyTHESIS team.</p>
                </div>
                <Button type="button" variant="secondary" onClick={() => void fetchDeliverables()} disabled={isDeliverablesLoading}>
                  <RefreshCw className={`h-4 w-4 ${isDeliverablesLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
                  Refresh
                </Button>
              </div>

              {deliverablesError && (
                <div role="alert" className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold">Deliverables unavailable</p>
                    <p className="mt-1 text-sm">{deliverablesError}</p>
                  </div>
                </div>
              )}

              {isDeliverablesLoading && (
                <div className="flex min-h-48 flex-col items-center justify-center text-center">
                  <LoaderCircle className="h-7 w-7 animate-spin text-brand-green" aria-hidden="true" />
                  <p className="mt-3 text-sm text-muted-foreground">Loading released deliverables...</p>
                </div>
              )}

              {!isDeliverablesLoading && !deliverablesError && deliverables.length === 0 && (
                <div className="mt-6 flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-green/10">
                    <PackageOpen className="h-6 w-6 text-brand-green" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">No deliverables released yet</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Files released by the JUSTmyTHESIS team will appear here when they are ready.</p>
                </div>
              )}

              {!isDeliverablesLoading && deliverables.length > 0 && (
                <div className="mt-6 space-y-4">
                  {deliverables.map((deliverable) => (
                    <div key={deliverable.id} className="flex flex-col gap-5 rounded-xl border border-gray-200 p-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-green/10">
                          <FileText className="h-5 w-5 text-brand-green" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="break-words font-semibold text-foreground">{deliverable.fileName}</h3>
                            {deliverable.isFinal && <Badge>Final</Badge>}
                            {deliverable.clientConfirmed && <Badge>Confirmed</Badge>}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span>Version {deliverable.versionNumber}</span>
                            <span>{formatFileSize(deliverable.fileSizeBytes)}</span>
                            <span>Released {formatDate(deliverable.releasedAt)}</span>
                          </div>
                          {deliverable.deliveryNotes && (
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">{deliverable.deliveryNotes}</p>
                          )}
                        </div>
                      </div>

                      <Button type="button" onClick={() => void handleDownload(deliverable)} disabled={downloadingId === deliverable.id}>
                        {downloadingId === deliverable.id ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <Download className="h-4 w-4" aria-hidden="true" />
                        )}
                        {downloadingId === deliverable.id ? 'Preparing...' : 'Download'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <ProjectMessages projectId={project.id} />
          </>
        )}
      </div>
    </main>
  );
}
