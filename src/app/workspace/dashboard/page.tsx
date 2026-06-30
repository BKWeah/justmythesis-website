'use client';

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
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from '@/lib/utils/date';

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
    'New Request': 'info',
    'Under Review': 'warning',
    'Waiting for Documents': 'warning',
    'Ready for Assessment': 'info',
    'Assessment Complete': 'success',
    'Recommendation Sent': 'info',
    'Waiting for Client Decision': 'warning',
    'Approved': 'success',
    'Declined': 'error',
    'Cancelled': 'error',
    'Project Activated': 'info',
    'Development': 'warning',
    'Quality Review': 'warning',
    'Ready for Delivery': 'success',
    'Delivered': 'success',
    'Completed': 'success',
    'Archived': 'default',
  };

  return (
    <Badge variant={variants[status] || 'default'}>
      {status}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  return (
    <Badge variant={priority === 'Urgent' ? 'error' : priority === 'High' ? 'warning' : 'default'}>
      {priority}
    </Badge>
  );
}

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-1 text-gray-500">
            Overview of your workspace activity and recent updates.
          </p>
        </div>
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-1 text-gray-500">
            Overview of your workspace activity and recent updates.
          </p>
        </div>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-1 text-gray-500">
            Overview of your workspace activity and recent updates.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/workspace/requests">
            <Button variant="secondary">
              <FileText className="h-4 w-4 mr-2" />
              View Requests
            </Button>
          </Link>
          <Link href="/workspace/projects">
            <Button>
              <FolderKanban className="h-4 w-4 mr-2" />
              View Projects
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Requests"
          value={stats.totalRequests}
          subtitle="All time"
          icon={<FileText className="h-6 w-6 text-brand-green" />}
        />
        <StatsCard
          title="Pending Review"
          value={stats.pendingRequests}
          subtitle="Awaiting action"
          icon={<Clock className="h-6 w-6 text-amber-500" />}
        />
        <StatsCard
          title="Active Projects"
          value={stats.activeProjects}
          subtitle="In progress"
          icon={<FolderKanban className="h-6 w-6 text-blue-500" />}
        />
        <StatsCard
          title="Completed"
          value={stats.completedProjects}
          subtitle="Successfully delivered"
          icon={<CheckCircle className="h-6 w-6 text-green-500" />}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Requests</CardTitle>
            <Link href="/workspace/requests">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data?.recentRequests && data.recentRequests.length > 0 ? (
              <div className="space-y-4">
                {data.recentRequests.slice(0, 5).map((request) => (
                  <div
                    key={request.id}
                    className="flex items-start justify-between py-3 border-b last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">
                        {request.working_title || 'Untitled Request'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {request.client?.full_name || 'Unknown'} •{' '}
                        {request.request_reference}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(request.created_at)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-4">
                      <StatusBadge status={request.status} />
                      <PriorityBadge priority={request.priority} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FileText className="h-6 w-6" />}
                title="No Requests Yet"
                description="Support requests from clients will appear here."
              />
            )}
          </CardContent>
        </Card>

        {/* Projects Requiring Attention */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Projects Requiring Attention</CardTitle>
            <Link href="/workspace/projects">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data?.attentionProjects && data.attentionProjects.length > 0 ? (
              <div className="space-y-4">
                {data.attentionProjects.map((project) => (
                  <div
                    key={project.id}
                    className="py-3 border-b last:border-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">
                          {project.project_title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {project.client?.full_name || 'Unknown'} •{' '}
                          {project.project_reference}
                        </p>
                      </div>
                      <StatusBadge status={project.status} />
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{project.completion_percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-green rounded-full transition-all"
                          style={{ width: `${project.completion_percentage}%` }}
                        />
                      </div>
                    </div>
                    {project.expected_delivery_date && (
                      <p className="text-xs text-gray-400 mt-2">
                        Due: {new Date(project.expected_delivery_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FolderKanban className="h-6 w-6" />}
                title="No Active Projects"
                description="Active projects requiring attention will appear here."
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/workspace/requests">
              <Button variant="secondary" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </Link>
            <Link href="/workspace/requests?filter=pending">
              <Button variant="secondary" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Review Pending
              </Button>
            </Link>
            <Link href="/workspace/projects">
              <Button variant="secondary" className="w-full justify-start">
                <FolderKanban className="h-4 w-4 mr-2" />
                Active Projects
              </Button>
            </Link>
            <Link href="/workspace/operations">
              <Button variant="secondary" className="w-full justify-start">
                <CheckCircle className="h-4 w-4 mr-2" />
                Operations GPT
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}