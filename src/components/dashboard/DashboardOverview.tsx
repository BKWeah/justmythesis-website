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
    <section className="space-y-4" aria-labelledby="scholar-haven-welcome">
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
        className="overflow-hidden border-[var(--border-subtle)] bg-white shadow-[0_10px_30px_rgba(16,24,40,0.06)]"
      >
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-[var(--surface-inverse)] px-6 py-7 text-white sm:px-8 sm:py-9">
          <div className="absolute inset-y-0 right-0 w-2/5 bg-[radial-gradient(circle_at_center,rgba(199,154,45,0.18),transparent_68%)]" aria-hidden="true" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-white/75">
                {greeting}, {clientName}
                {/[.!?]$/.test(clientName) ? '' : '.'}
              </p>

              <h1
                id="scholar-haven-welcome"
                className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl"
              >
                Welcome to Scholar Haven.
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
                Follow project progress, access released deliverables, review updates, and stay connected with the JUSTmyTHESIS team.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Button type="button" size="lg" onClick={onNewRequest}>
                <Plus className="h-5 w-5" />
                New Request
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={onViewProjects}
                className="border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white"
              >
                <FolderKanban className="h-5 w-5" />
                My Projects
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}