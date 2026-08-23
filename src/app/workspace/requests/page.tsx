'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRequests, RequestFilters } from '@/hooks/useRequests';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Search, Filter, FileText, ArrowRight, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils/date';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'New Request', label: 'New Request' },
  { value: 'Under Review', label: 'Under Review' },
  { value: 'Waiting for Documents', label: 'Waiting for Documents' },
  { value: 'Ready for Assessment', label: 'Ready for Assessment' },
  { value: 'Assessment Complete', label: 'Assessment Complete' },
  { value: 'Recommendation Sent', label: 'Recommendation Sent' },
  { value: 'Waiting for Client Decision', label: 'Waiting for Client Decision' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Declined', label: 'Declined' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Project Activated', label: 'Project Activated' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'Low', label: 'Low' },
  { value: 'Normal', label: 'Normal' },
  { value: 'High', label: 'High' },
  { value: 'Urgent', label: 'Urgent' },
];

const SERVICE_OPTIONS = [
  { value: '', label: 'All Services' },
  { value: 'A - Proposal Development', label: 'Package A: Proposal Development' },
  { value: 'B - Foundation Thesis', label: 'Package B: Foundation Thesis' },
  { value: 'C - Complete Thesis Development', label: 'Package C: Complete Thesis Development' },
  { value: 'D - Thesis Rescue', label: 'Package D: Thesis Rescue' },
  { value: 'E - Formatting & Compliance', label: 'Package E: Formatting & Compliance' },
  { value: 'F - Defense Presentation', label: 'Package F: Defense Presentation' },
];

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

export default function RequestsPage() {
  const [filters, setFilters] = useState<RequestFilters>({ search: '', status: '', priority: '', service: '', institution: '' });
  const [showFilters, setShowFilters] = useState(false);
  const { requests, isLoading, error } = useRequests(filters);
  const [institutions, setInstitutions] = useState<string[]>([]);

  useEffect(() => {
    setInstitutions([...new Set(requests.map(r => r.clients?.institution).filter(Boolean) as string[])].sort());
  }, [requests]);

  const clearFilters = () => setFilters({ search: '', status: '', priority: '', service: '', institution: '' });
  const hasActiveFilters = Boolean(filters.status || filters.priority || filters.service || filters.institution);

  if (isLoading) return <LoadingState />;
  if (error) return <EmptyState icon={<FileText className="h-8 w-8 text-red-500" />} title="Error Loading Requests" description={error} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-green/70">Operations queue</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-gray-950">Requests</h2>
          <p className="mt-2 text-sm text-gray-500">Manage incoming support requests and assessment workflows.</p>
        </div>
        <div className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 shadow-sm">{requests.length} total</div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="border-b border-gray-100 p-4 sm:p-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search reference, client, phone, email or institution"
                className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-white pl-10 pr-4 text-sm text-gray-900 shadow-sm outline-none transition focus:border-brand-green focus:ring-4 focus:ring-brand-green/10"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
            <button onClick={() => setShowFilters(!showFilters)} className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-brand-green">
              <Filter className="h-4 w-4" /> Filters
              {hasActiveFilters && <span className="rounded-full bg-brand-green px-2 py-0.5 text-[11px] font-semibold text-white">Active</span>}
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            {hasActiveFilters && <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-red-600">Clear filters</button>}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 gap-4 border-t border-gray-100 bg-[var(--surface-subtle)] px-4 py-4 sm:grid-cols-2 lg:grid-cols-4 sm:px-5">
              <Select label="Status" value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))} options={STATUS_OPTIONS} />
              <Select label="Priority" value={filters.priority} onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))} options={PRIORITY_OPTIONS} />
              <Select label="Service" value={filters.service} onChange={(e) => setFilters(prev => ({ ...prev, service: e.target.value }))} options={SERVICE_OPTIONS} />
              <Select label="Institution" value={filters.institution} onChange={(e) => setFilters(prev => ({ ...prev, institution: e.target.value }))} options={[{ value: '', label: 'All Institutions' }, ...institutions.map(i => ({ value: i, label: i }))]} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden" padding="none">
        {requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[var(--surface-subtle)]">
                <tr className="border-b border-[var(--border-subtle)]">
                  {['Reference','Client','Institution','Service','Status','Priority','Submitted','Action'].map(label => (
                    <th key={label} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] bg-white">
                {requests.map(request => (
                  <tr key={request.id} className="transition-colors hover:bg-[var(--surface-subtle)]/70">
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-brand-green">{request.request_reference}</td>
                    <td className="px-5 py-4"><p className="font-medium text-gray-900">{request.clients?.full_name || 'Unknown'}</p><p className="mt-0.5 text-xs text-gray-500">{request.clients?.email}</p></td>
                    <td className="px-5 py-4 text-gray-600">{request.clients?.institution || '-'}</td>
                    <td className="px-5 py-4 text-gray-600">{request.requested_service}</td>
                    <td className="px-5 py-4"><StatusBadge status={request.status} /></td>
                    <td className="px-5 py-4"><PriorityBadge priority={request.priority} /></td>
                    <td className="px-5 py-4 text-gray-500">{formatDistanceToNow(request.created_at)}</td>
                    <td className="px-5 py-4"><Link href={`/workspace/requests/${request.id}`}><Button variant="ghost" size="sm">Open <ArrowRight className="h-4 w-4" /></Button></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8"><EmptyState icon={<FileText className="h-8 w-8" />} title="No Requests Found" description={filters.search || hasActiveFilters ? 'No requests match your current search or filters.' : 'Client support requests will appear here.'} /></div>
        )}
      </Card>
    </div>
  );
}