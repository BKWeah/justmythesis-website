'use client';

import { useDashboardData } from '@/hooks/useDashboardData';
import { StatsCard } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { DashboardErrorBoundary } from '@/components/DashboardErrorBoundary';
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

function DashboardContent() {
  return (
    <div style={{ padding: '40px' }}>
      <h1>Dashboard Loaded</h1>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}