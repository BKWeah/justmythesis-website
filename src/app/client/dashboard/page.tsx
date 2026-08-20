'use client';

import {
  AlertCircle,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import {
  DashboardStats,
  type DashboardStatsData,
} from '@/components/dashboard/DashboardStats';
import {
  RecentProjectsTable,
  type RecentProject,
} from '@/components/dashboard/RecentProjectsTable';
import { Button, Card } from '@/components/ui';

interface ClientDashboardData {
  clientName: string;
  stats: DashboardStatsData;
  recentProjects: RecentProject[];
}

interface ClientDashboardError {
  error?: string;
}

export default function ClientDashboardPage() {
  const router = useRouter();

  const [dashboard, setDashboard] =
    useState<ClientDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/client/dashboard', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
        },
      });

      const data = (await response.json()) as
        | ClientDashboardData
        | ClientDashboardError;

      if (response.status === 401) {
        router.replace('/client/login');
        return;
      }

      if (!response.ok) {
        throw new Error(
          'error' in data && data.error
            ? data.error
            : 'Unable to retrieve your dashboard.'
        );
      }

      setDashboard(data as ClientDashboardData);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to retrieve your dashboard.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const openProjects = () => {
    router.push('/client/projects');
  };

  const openProject = (projectId: string) => {
    router.push(
      `/client/project/${encodeURIComponent(projectId)}`
    );
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-10 px-6 py-10">
        {isLoading && (
          <Card variant="bordered" padding="lg" className="bg-white">
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <LoaderCircle
                className="h-8 w-8 animate-spin text-brand-green"
                aria-hidden="true"
              />

              <h1 className="mt-4 text-lg font-semibold text-foreground">
                Loading your Scholar Haven
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Please wait while we retrieve your academic workspace.
              </p>
            </div>
          </Card>
        )}

        {!isLoading && error && (
          <Card variant="bordered" padding="lg" className="bg-white">
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <AlertCircle
                  className="h-6 w-6 text-red-600"
                  aria-hidden="true"
                />
              </div>

              <h1 className="mt-4 text-lg font-semibold text-foreground">
                We could not load your dashboard
              </h1>

              <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                {error}
              </p>

              <Button
                type="button"
                className="mt-5"
                onClick={() => void fetchDashboard()}
              >
                <RefreshCw
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {!isLoading && !error && dashboard && (
          <>
            <DashboardOverview
              clientName={dashboard.clientName}
              onNewRequest={() =>
                router.push('/client/request-support')
              }
              onViewProjects={openProjects}
              onProfile={() => router.push('/client/profile')}
            />

            <DashboardStats stats={dashboard.stats} />

            <RecentProjectsTable
              projects={dashboard.recentProjects}
              onViewProject={openProject}
              onViewAllProjects={openProjects}
            />
          </>
        )}
      </div>
    </main>
  );
}