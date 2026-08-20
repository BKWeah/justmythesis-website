'use client';

import {
  FolderKanban,
  Plus,
  UserRound,
} from 'lucide-react';
import { useMemo } from 'react';

import { Button, Card } from '@/components/ui';

interface DashboardOverviewProps {
  clientName: string;
  onNewRequest: () => void;
  onViewProjects: () => void;
  onProfile: () => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function DashboardOverview({
  clientName,
  onNewRequest,
  onViewProjects,
  onProfile,
}: DashboardOverviewProps) {
  const greeting = useMemo(() => getGreeting(), []);

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onProfile}
        >
          <UserRound className="h-4 w-4" />
          Profile
        </Button>
      </div>

      <Card
        variant="bordered"
        padding="lg"
        className="overflow-hidden bg-white"
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-brand-green">
              {greeting}, {clientName}
              {/[.!?]$/.test(clientName) ? '' : '.'}
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Welcome to your Scholar Haven.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Everything you need to manage your academic projects in one
              personalized workspace.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              size="lg"
              onClick={onNewRequest}
            >
              <Plus className="h-5 w-5" />
              New Request
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={onViewProjects}
            >
              <FolderKanban className="h-5 w-5" />
              My Projects
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}