'use client';

import { ArrowRight, FolderKanban } from 'lucide-react';

import { Button, Card } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

export interface RecentProject {
  id: string;
  title: string;
  service: string;
  stage: string;
  progress: number;
  consultant: string;
  lastUpdated: string;
}

interface RecentProjectsTableProps {
  projects?: RecentProject[];
  onViewProject?: (projectId: string) => void;
  onViewAllProjects?: () => void;
}

function getStageStyles(stage: string): string {
  const normalizedStage = stage.toLowerCase();

  if (normalizedStage.includes('review') || normalizedStage.includes('awaiting')) {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }

  if (normalizedStage.includes('complete') || normalizedStage.includes('released')) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  return 'border-blue-200 bg-blue-50 text-blue-700';
}

function ProgressIndicator({ value }: { value: number }) {
  const safeValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className="min-w-[150px]">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-[var(--text-primary)]">{safeValue}%</span>
        <span className="text-xs text-[var(--text-muted)]">
          {safeValue === 100 ? 'Complete' : 'In progress'}
        </span>
      </div>

      <div
        className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]"
        role="progressbar"
        aria-label={`Project progress: ${safeValue}%`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safeValue}
      >
        <div
          className="h-full rounded-full bg-brand-green transition-all duration-300"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

export function RecentProjectsTable({
  projects = [],
  onViewProject,
  onViewAllProjects,
}: RecentProjectsTableProps) {
  return (
    <section aria-labelledby="recent-projects-heading">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-green">Project activity</p>
          <h2 id="recent-projects-heading" className="mt-2 text-xl font-semibold text-[var(--text-primary)]">
            Recent Projects
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Track the latest activity across your academic projects.
          </p>
        </div>

        <Button type="button" variant="secondary" size="sm" onClick={onViewAllProjects}>
          View All Projects
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <Card variant="bordered" padding="none" className="overflow-hidden bg-white shadow-sm">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green/10">
              <FolderKanban className="h-7 w-7 text-brand-green" aria-hidden="true" />
            </div>
            <h3 className="mt-5 text-base font-semibold text-[var(--text-primary)]">No projects yet</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
              Your submitted academic projects will appear here once they are created.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 p-4 md:hidden">
              {projects.map((project) => (
                <article key={project.id} className="rounded-2xl border border-[var(--border-subtle)] bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-green/10">
                      <FolderKanban className="h-5 w-5 text-brand-green" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{project.id}</p>
                      <h3 className="mt-1 break-words font-semibold text-[var(--text-primary)]">{project.title}</h3>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">{project.service}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className={cn('inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold', getStageStyles(project.stage))}>
                      {project.stage}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">Updated {project.lastUpdated}</span>
                  </div>

                  <div className="mt-4">
                    <ProgressIndicator value={project.progress} />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4">
                    <p className="text-xs text-[var(--text-muted)]">
                      Consultant: <span className="font-medium text-[var(--text-secondary)]">{project.consultant}</span>
                    </p>
                    <Button type="button" size="sm" onClick={() => onViewProject?.(project.id)}>
                      View
                    </Button>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1050px] border-collapse text-left">
                <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)]">
                  <tr>
                    {['Project', 'Service', 'Current Stage', 'Progress', 'Assigned Consultant', 'Last Updated'].map((heading) => (
                      <th key={heading} className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                        {heading}
                      </th>
                    ))}
                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--border-subtle)] bg-white">
                  {projects.map((project) => (
                    <tr key={project.id} className="transition-colors hover:bg-[var(--surface-subtle)]/70">
                      <td className="px-5 py-5 align-top">
                        <div className="max-w-[290px]">
                          <p className="text-sm font-semibold text-[var(--text-primary)]">{project.title}</p>
                          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">{project.id}</p>
                        </div>
                      </td>
                      <td className="px-5 py-5 align-top text-sm text-[var(--text-secondary)]">{project.service}</td>
                      <td className="px-5 py-5 align-top">
                        <span className={cn('inline-flex rounded-full border px-3 py-1 text-xs font-semibold', getStageStyles(project.stage))}>
                          {project.stage}
                        </span>
                      </td>
                      <td className="px-5 py-5 align-top"><ProgressIndicator value={project.progress} /></td>
                      <td className="px-5 py-5 align-top text-sm text-[var(--text-secondary)]">{project.consultant}</td>
                      <td className="px-5 py-5 align-top text-sm text-[var(--text-muted)]">{project.lastUpdated}</td>
                      <td className="px-5 py-5 text-right align-top">
                        <Button type="button" variant="secondary" size="sm" onClick={() => onViewProject?.(project.id)}>
                          View Project
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </section>
  );
}
