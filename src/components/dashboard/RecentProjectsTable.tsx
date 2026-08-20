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

  if (
    normalizedStage.includes('review') ||
    normalizedStage.includes('awaiting')
  ) {
    return 'bg-amber-50 text-amber-700 ring-amber-200';
  }

  if (
    normalizedStage.includes('complete') ||
    normalizedStage.includes('released')
  ) {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  }

  return 'bg-blue-50 text-blue-700 ring-blue-200';
}

function ProgressIndicator({ value }: { value: number }) {
  const safeValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className="min-w-[140px]">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">
          {safeValue}%
        </span>

        <span className="text-xs text-muted-foreground">
          {safeValue === 100 ? 'Complete' : 'In progress'}
        </span>
      </div>

      <div
        className="h-2 overflow-hidden rounded-full bg-gray-100"
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
          <h2
            id="recent-projects-heading"
            className="text-xl font-semibold text-foreground"
          >
            Recent Projects
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Track the latest activity across your academic projects.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onViewAllProjects}
        >
          View All Projects
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <Card variant="bordered" padding="none" className="overflow-hidden">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green/10">
              <FolderKanban
                className="h-6 w-6 text-brand-green"
                aria-hidden="true"
              />
            </div>

            <h3 className="mt-4 text-base font-semibold text-foreground">
              No projects yet
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Your submitted academic projects will appear here once they are
              created.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left">
              <thead className="border-b border-gray-200 bg-gray-50/80">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Project
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Service
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Current Stage
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Progress
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Assigned Consultant
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Last Updated
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    className="transition-colors hover:bg-gray-50/70"
                  >
                    <td className="px-5 py-5 align-top">
                      <div className="max-w-[290px]">
                        <p className="text-sm font-semibold text-foreground">
                          {project.title}
                        </p>

                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                          {project.id}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-5 align-top text-sm text-foreground">
                      {project.service}
                    </td>

                    <td className="px-5 py-5 align-top">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
                          getStageStyles(project.stage)
                        )}
                      >
                        {project.stage}
                      </span>
                    </td>

                    <td className="px-5 py-5 align-top">
                      <ProgressIndicator value={project.progress} />
                    </td>

                    <td className="px-5 py-5 align-top text-sm text-foreground">
                      {project.consultant}
                    </td>

                    <td className="px-5 py-5 align-top text-sm text-muted-foreground">
                      {project.lastUpdated}
                    </td>

                    <td className="px-5 py-5 text-right align-top">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onViewProject?.(project.id)}
                      >
                        View Project
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  );
}