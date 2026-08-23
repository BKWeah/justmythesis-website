'use client';

import React from 'react';
import Link from 'next/link';
import { useDashboardData } from '@/hooks/useDashboardData';
import { StatsCard } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  FileText,
  Clock,
  FolderKanban,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils/date';

class DashboardErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <EmptyState
          icon={<AlertCircle className="h-8 w-8 text-red-500" />}
          title="Something went wrong"
          description="An error occurred while loading the dashboard."
        />
      );
    }
    return this.props.children;
  }
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
    'New Request': 'info',
    'Under Review': 'warning',
    'Waiting for Documents': 'warning',
    'Ready for Assessment': 'info',
    'Assessment Complete': 'success',
    'Recommendation Sent': 'info',
    'Waiting for Client Decision': 'warning',
    Approved: 'success',
    Declined: 'error',
    Cancelled: 'error',
    'Project Activated': 'info',
    Development: 'warning',
    'Quality Review': 'warning',
    'Ready for Delivery': 'success',
    Delivered: 'success',
    Completed: 'success',
    Archived: 'default',
  };
  return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
}

function PriorityBadge({ priority }: { priority: string }) {
  return (
    <Badge variant={priority === 'Urgent' ? 'error' : priority === 'High' ? 'warning' : 'default'}>
      {priority}
    </Badge>
  );
}

function DashboardContent() {
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-brand-green">Workspace overview</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)] sm:text-3xl">Dashboard</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Overview of workspace activity and recent updates.</p>
        </div>
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={<AlertCircle className="h-8 w-8 text-red-500" />}
          title="Error Loading Dashboard"
          description={error}
        />
      </div>
    );
  }

  const stats = data?.stats || {
    totalRequests: 0,
    pendingRequests: 0,
    activeProjects: 0,
    completedProjects: 0,
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-brand-green">Workspace overview</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.035em] text-[var(--text-primary)] sm:text-3xl">Dashboard</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Monitor requests, active projects and items that need attention from one place.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/workspace/requests">
            <Button variant="secondary" className="w-full sm:w-auto">
              <FileText className="h-4 w-4" />
              View Requests
            </Button>
          </Link>
          <Link href="/workspace/projects">
            <Button className="w-full sm:w-auto">
              <FolderKanban className="h-4 w-4" />
              View Projects
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total Requests" value={stats.totalRequests} subtitle="All time" icon={<FileText className="h-5 w-5" />} />
        <StatsCard title="Pending Review" value={stats.pendingRequests} subtitle="Awaiting action" icon={<Clock className="h-5 w-5" />} />
        <StatsCard title="Active Projects" value={stats.activeProjects} subtitle="In progress" icon={<FolderKanban className="h-5 w-5" />} />
        <StatsCard title="Completed" value={stats.completedProjects} subtitle="Successfully delivered" icon={<CheckCircle className="h-5 w-5" />} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Recent Requests</CardTitle>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Latest client requests entering the workflow.</p>
            </div>
            <Link href="/workspace/requests">
              <Button variant="ghost" size="sm">View All <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data?.recentRequests && data.recentRequests.length > 0 ? (
              <div className="divide-y divide-[var(--border-subtle)]">
                {data.recentRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="flex items-start justify-between gap-4 py-4 first:pt-1 last:pb-1">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{request.working_title || 'Untitled Request'}</p>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">{request.client?.full_name || 'Unknown'} • {request.request_reference}</p>
                      <p className="mt-1.5 text-xs text-[var(--text-muted)]">{formatDistanceToNow(request.created_at)}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <StatusBadge status={request.status} />
                      <PriorityBadge priority={request.priority} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<FileText className="h-6 w-6" />} title="No Requests Yet" description="Support requests from clients will appear here." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Projects Requiring Attention</CardTitle>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Active work that may need follow-up.</p>
            </div>
            <Link href="/workspace/projects">
              <Button variant="ghost" size="sm">View All <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data?.attentionProjects && data.attentionProjects.length > 0 ? (
              <div className="divide-y divide-[var(--border-subtle)]">
                {data.attentionProjects.map((project) => (
                  <div key={project.id} className="py-4 first:pt-1 last:pb-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{project.project_title}</p>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">{project.client?.full_name || 'Unknown'} • {project.project_reference}</p>
                      </div>
                      <StatusBadge status={project.status} />
                    </div>
                    <div className="mt-4">
                      <div className="mb-1.5 flex items-center justify-between text-xs text-[var(--text-muted)]">
                        <span>Progress</span>
                        <span>{project.completion_percentage}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                        <div className="h-full rounded-full bg-brand-green transition-all" style={{ width: `${project.completion_percentage}%` }} />
                      </div>
                    </div>
                    {project.expected_delivery_date && (
                      <p className="mt-2 text-xs text-[var(--text-muted)]">Due: {new Date(project.expected_delivery_date).toLocaleDateString()}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<FolderKanban className="h-6 w-6" />} title="No Active Projects" description="Active projects requiring attention will appear here." />
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Move directly to the most common workspace tasks.</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Link href="/workspace/requests"><Button variant="secondary" className="w-full justify-start"><Plus className="h-4 w-4" />New Request</Button></Link>
            <Link href="/workspace/requests?filter=pending"><Button variant="secondary" className="w-full justify-start"><Clock className="h-4 w-4" />Review Pending</Button></Link>
            <Link href="/workspace/projects"><Button variant="secondary" className="w-full justify-start"><FolderKanban className="h-4 w-4" />Active Projects</Button></Link>
            <Link href="/workspace/operations"><Button variant="secondary" className="w-full justify-start"><CheckCircle className="h-4 w-4" />Operations GPT</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardErrorBoundary>
      <DashboardContent />
    </DashboardErrorBoundary>
  );
}
