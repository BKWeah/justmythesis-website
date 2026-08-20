'use client';

import {
  Bell,
  CircleDollarSign,
  Download,
  FolderKanban,
  MessageSquareText,
  TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { DashboardStatCard } from './DashboardStatCard';

export interface DashboardStatsData {
  activeProjects: number;
  averageProgress: number;
  pendingPayments: number;
  releasedDeliverables: number;
  unreadMessages: number;
  unreadNotifications: number;
}

interface DashboardStatsProps {
  stats?: DashboardStatsData;
}

const emptyStats: DashboardStatsData = {
  activeProjects: 0,
  averageProgress: 0,
  pendingPayments: 0,
  releasedDeliverables: 0,
  unreadMessages: 0,
  unreadNotifications: 0,
};

export function DashboardStats({
  stats = emptyStats,
}: DashboardStatsProps) {
  const router = useRouter();

  const dashboardStats = [
    {
      title: 'Active Projects',
      description: 'Track your ongoing academic projects.',
      value: `${stats.activeProjects} Active`,
      actionLabel: 'View Projects',
      icon: FolderKanban,
      iconColor: 'text-blue-700',
      iconBackground: 'bg-blue-50',
      onClick: () => router.push('/client/projects'),
    },
    {
      title: 'Project Progress',
      description: 'See how far each project has progressed.',
      value: `${stats.averageProgress}% Complete`,
      actionLabel: 'View Progress',
      icon: TrendingUp,
      iconColor: 'text-green-700',
      iconBackground: 'bg-green-50',
      onClick: () => router.push('/client/projects'),
    },
    {
      title: 'Pending Payments',
      description: 'Manage your outstanding payments.',
      value: `${stats.pendingPayments} Pending`,
      actionLabel: 'View Payments',
      icon: CircleDollarSign,
      iconColor: 'text-amber-700',
      iconBackground: 'bg-amber-50',
      onClick: () => router.push('/client/projects'),
    },
    {
      title: 'Released Deliverables',
      description: 'Download completed project deliverables.',
      value: `${stats.releasedDeliverables} Ready`,
      actionLabel: 'View Deliverables',
      icon: Download,
      iconColor: 'text-violet-700',
      iconBackground: 'bg-violet-50',
      onClick: () => router.push('/client/projects'),
    },
    {
      title: 'Messages',
      description: 'Stay connected with the JUSTmyTHESIS team.',
      value: `${stats.unreadMessages} New`,
      actionLabel: 'View Messages',
      icon: MessageSquareText,
      iconColor: 'text-cyan-700',
      iconBackground: 'bg-cyan-50',
    },
    {
      title: 'Notifications',
      description: 'Never miss an important project update.',
      value: `${stats.unreadNotifications} Unread`,
      actionLabel: 'View Notifications',
      icon: Bell,
      iconColor: 'text-rose-700',
      iconBackground: 'bg-rose-50',
      onClick: () => router.push('/client/notifications'),
    },
  ];

  return (
    <section aria-labelledby="dashboard-stats-heading">
      <div className="mb-5">
        <h2
          id="dashboard-stats-heading"
          className="text-xl font-semibold text-foreground"
        >
          Your Workspace
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Everything you need to manage your current academic work.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {dashboardStats.map((stat) => (
          <DashboardStatCard key={stat.title} {...stat} />
        ))}
      </div>
    </section>
  );
}