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

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</p>
      <div className="mt-2 text-sm font-semibold text-[var(--text-primary)]">{children}</div>
    </div>
  );
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
      setError(requestError instanceof Error ? requestError.message : 'Unable to retrieve this project.');
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
      if (!response.ok) throw new Error(data.error || 'Unable to retrieve deliverables.');
      setDeliverables(data.deliverables || []);
    } catch (requestError) {
      setDeliverables([]);
      setDeliverablesError(requestError instanceof Error ? requestError.message : 'Unable to retrieve deliverables.');
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
        `/api/client/projects/${encodeURIComponent(projectIdentifier)}/deliverables?deliverableId=${encodeURIComponent(deliverable.id)}`,
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
      if (!response.ok || !data.url) throw new Error(data.error || 'Unable to download this file.');
      window.location.assign(data.url);
    } catch (requestError) {
      setDeliverablesError(requestError instanceof Error ? requestError.message : 'Unable to download this file.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--surface-page)]">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-green">Scholar Haven</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Project workspace</p>
          </div>
          <Button type="button" variant="secondary" onClick={() => router.push('/client/projects')}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            My Projects
          </Button>
        </div>

        {isLoading && (
          <Card variant="bordered" padding="lg" className="border-[var(--border-subtle)] bg-white shadow-sm">
            <div className="flex min-h-72 flex-col items-center justify-center text-center">
              <LoaderCircle className="h-8 w-8 animate-spin text-brand-green" aria-hidden="true" />
              <h1 className="mt-4 text-xl font-semibold text-[var(--text-primary)]">Loading project details</h1>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Please wait while we retrieve your project.</p>
            </div>
          </Card>
        )}

        {!isLoading && error && (
          <Card variant="bordered" padding="lg" className="border-[var(--border-subtle)] bg-white shadow-sm">
            <div className="flex min-h-72 flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
                <AlertCircle className="h-6 w-6 text-red-600" aria-hidden="true" />
              </div>
              <h1 className="mt-4 text-xl font-semibold text-[var(--text-primary)]">We could not load this project</h1>
              <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--text-secondary)]">{error}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button type="button" onClick={() => void fetchProject()}>
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />Try Again
                </Button>
                <Button type="button" variant="secondary" onClick={() => router.push('/client/projects')}>View My Projects</Button>
              </div>
            </div>
          </Card>
        )}

        {!isLoading && !error && project && (
          <>
            <section className="overflow-hidden rounded-3xl border border-brand-green/10 bg-white shadow-sm">
              <div className="h-1.5 bg-gradient-to-r from-brand-green via-brand-green-light to-gold" />
              <div className="p-6 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-green/10">
                      <FolderKanban className="h-6 w-6 text-brand-green" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-brand-green">{project.projectReference}</p>
                      <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">{project.title}</h1>
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">{project.service}</p>
                    </div>
                  </div>
                  <Badge variant="info">{project.status}</Badge>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailItem label="Project Status">{project.status}</DetailItem>
                  <DetailItem label="Approved Service">{project.service}</DetailItem>
                  <DetailItem label="Start Date"><span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-brand-green" />{formatDate(project.startDate)}</span></DetailItem>
                  <DetailItem label="Target Deadline"><span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-brand-green" />{formatDate(project.expectedDeliveryDate)}</span></DetailItem>
                  <DetailItem label="Last Updated">{formatDate(project.updatedAt)}</DetailItem>
                  <DetailItem label="Completion"><span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand-green" />{project.progress}%</span></DetailItem>
                </div>

                <div className="mt-7 rounded-2xl bg-[var(--surface-subtle)] p-5">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">Overall Progress</span>
                    <span className="text-sm font-bold text-brand-green">{project.progress}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white" role="progressbar" aria-label={`${project.title} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={project.progress}>
                    <div className="h-full rounded-full bg-brand-green transition-all" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <Card variant="bordered" padding="lg" className="border-[var(--border-subtle)] bg-white shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-green/10">
                    <Activity className="h-5 w-5 text-brand-green" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">Project Timeline</h2>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">Key client-visible milestones and project updates.</p>
                  </div>
                </div>

                {project.timeline.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--surface-subtle)] px-6 py-10 text-center">
                    <p className="font-semibold text-[var(--text-primary)]">No timeline updates yet</p>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">Important project updates will appear here as work progresses.</p>
                  </div>
                ) : (
                  <div className="mt-6">
                    {project.timeline.map((event, index) => (
                      <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                        {index < project.timeline.length - 1 && <div className="absolute left-[7px] top-5 h-full w-px bg-[var(--border-subtle)]" aria-hidden="true" />}
                        <div className="relative mt-1 h-4 w-4 shrink-0 rounded-full border-4 border-green-100 bg-brand-green" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)]">{event.description}</p>
                          <p className="mt-1 text-xs text-[var(--text-muted)]">{formatDateTime(event.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card variant="bordered" padding="lg" className="border-[var(--border-subtle)] bg-white shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">Deliverables</h2>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">Download files released by the JUSTmyTHESIS team.</p>
                  </div>
                  <Button type="button" variant="secondary" size="sm" onClick={() => void fetchDeliverables()} disabled={isDeliverablesLoading}>
                    <RefreshCw className={`h-4 w-4 ${isDeliverablesLoading ? 'animate-spin' : ''}`} aria-hidden="true" />Refresh
                  </Button>
                </div>

                {deliverablesError && (
                  <div role="alert" className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                    <div><p className="font-semibold">Deliverables unavailable</p><p className="mt-1 text-sm">{deliverablesError}</p></div>
                  </div>
                )}

                {isDeliverablesLoading && (
                  <div className="flex min-h-48 flex-col items-center justify-center text-center">
                    <LoaderCircle className="h-7 w-7 animate-spin text-brand-green" aria-hidden="true" />
                    <p className="mt-3 text-sm text-[var(--text-secondary)]">Loading released deliverables...</p>
                  </div>
                )}

                {!isDeliverablesLoading && !deliverablesError && deliverables.length === 0 && (
                  <div className="mt-6 flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--surface-subtle)] px-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green/10"><PackageOpen className="h-6 w-6 text-brand-green" aria-hidden="true" /></div>
                    <h3 className="mt-4 font-semibold text-[var(--text-primary)]">No deliverables released yet</h3>
                    <p className="mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">Files released by the JUSTmyTHESIS team will appear here when they are ready.</p>
                  </div>
                )}

                {!isDeliverablesLoading && deliverables.length > 0 && (
                  <div className="mt-6 space-y-3">
                    {deliverables.map((deliverable) => (
                      <div key={deliverable.id} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white"><FileText className="h-5 w-5 text-brand-green" aria-hidden="true" /></div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="break-words text-sm font-semibold text-[var(--text-primary)]">{deliverable.fileName}</h3>
                                {deliverable.isFinal && <Badge variant="success">Final</Badge>}
                                {deliverable.clientConfirmed && <Badge variant="info">Confirmed</Badge>}
                              </div>
                              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
                                <span>Version {deliverable.versionNumber}</span><span>{formatFileSize(deliverable.fileSizeBytes)}</span><span>Released {formatDate(deliverable.releasedAt)}</span>
                              </div>
                              {deliverable.deliveryNotes && <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{deliverable.deliveryNotes}</p>}
                            </div>
                          </div>
                          <Button type="button" size="sm" onClick={() => void handleDownload(deliverable)} disabled={downloadingId === deliverable.id}>
                            {downloadingId === deliverable.id ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
                            {downloadingId === deliverable.id ? 'Preparing...' : 'Download'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <ProjectMessages projectId={project.id} />
          </>
        )}
      </div>
    </main>
  );
}
