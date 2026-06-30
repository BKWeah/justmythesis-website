'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRequests, RequestFilters } from '@/hooks/useRequests';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { 
  Search, 
  Filter, 
  FileText, 
  ArrowRight,
  Download,
  ChevronDown
} from 'lucide-react';
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
    'Approved': 'success',
    'Declined': 'error',
    'Cancelled': 'error',
    'Project Activated': 'info',
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

export default function RequestsPage() {
  const [filters, setFilters] = useState<RequestFilters>({
    search: '',
    status: '',
    priority: '',
    service: '',
    institution: '',
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const { requests, isLoading, error, refetch } = useRequests(filters);

  // Get unique institutions for filter
  const [institutions, setInstitutions] = useState<string[]>([]);
  
  useEffect(() => {
    const uniqueInstitutions = [...new Set(
      requests
        .map(r => r.clients?.institution)
        .filter(Boolean) as string[]
    )].sort();
    setInstitutions(uniqueInstitutions);
  }, [requests]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleFilterChange = (key: keyof RequestFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      service: '',
      institution: '',
    });
  };

  const hasActiveFilters = filters.status || filters.priority || filters.service || filters.institution;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Requests</h2>
          <p className="mt-1 text-gray-500">
            View and manage support requests.
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
          <h2 className="text-2xl font-bold text-gray-900">Requests</h2>
          <p className="mt-1 text-gray-500">
            View and manage support requests.
          </p>
        </div>
        <EmptyState
          icon={<FileText className="h-8 w-8 text-red-500" />}
          title="Error Loading Requests"
          description={error}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Requests</h2>
          <p className="mt-1 text-gray-500">
            View and manage support requests ({requests.length} total)
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by reference, client name, phone, email, or institution..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-brand-green"
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="px-1.5 py-0.5 bg-brand-green text-white text-xs rounded">
                    Active
                  </span>
                )}
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-red-500"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2 border-t">
                <Select
                  label="Status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  options={STATUS_OPTIONS}
                />
                <Select
                  label="Priority"
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  options={PRIORITY_OPTIONS}
                />
                <Select
                  label="Service"
                  value={filters.service}
                  onChange={(e) => handleFilterChange('service', e.target.value)}
                  options={SERVICE_OPTIONS}
                />
                <Select
                  label="Institution"
                  value={filters.institution}
                  onChange={(e) => handleFilterChange('institution', e.target.value)}
                  options={[
                    { value: '', label: 'All Institutions' },
                    ...institutions.map(i => ({ value: i, label: i })),
                  ]}
                />
                <div className="flex items-end">
                  <Button variant="secondary" onClick={clearFilters} className="w-full">
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        {requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Institution
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-medium text-brand-green">
                        {request.request_reference}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {request.clients?.full_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {request.clients?.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {request.clients?.institution || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {request.requested_service}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={request.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(request.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/workspace/requests/${request.id}`}>
                        <Button variant="ghost" size="sm">
                          Open
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <CardContent className="p-8">
            <EmptyState
              icon={<FileText className="h-8 w-8" />}
              title="No Requests Found"
              description={filters.search || hasActiveFilters 
                ? "No requests match your search criteria. Try adjusting your filters."
                : "No support requests yet. Requests will appear here when clients submit them."
              }
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
}