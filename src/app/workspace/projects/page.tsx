'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useProjects, ProjectFilters } from '@/hooks/useProjects';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { 
  Search, 
  Filter, 
  FolderKanban, 
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { formatDistanceToNow, formatDate } from '@/lib/utils/date';

const STAGE_OPTIONS = [
  { value: '', label: 'All Stages' },
  { value: 'Initiated', label: 'Initiated' },
  { value: 'Research', label: 'Research' },
  { value: 'Writing', label: 'Writing' },
  { value: 'Review', label: 'Review' },
  { value: 'Quality Assurance', label: 'Quality Assurance' },
  { value: 'Ready for Delivery', label: 'Ready for Delivery' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Completed', label: 'Completed' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'Project Activated', label: 'Active' },
  { value: 'Development', label: 'In Progress' },
  { value: 'Quality Review', label: 'Quality Review' },
  { value: 'Ready for Delivery', label: 'Ready for Delivery' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Archived', label: 'Archived' },
];

const STAGE_COLORS: Record<string, string> = {
  'Initiated': 'bg-blue-100 text-blue-800',
  'Research': 'bg-purple-100 text-purple-800',
  'Writing': 'bg-amber-100 text-amber-800',
  'Review': 'bg-orange-100 text-orange-800',
  'Quality Assurance': 'bg-teal-100 text-teal-800',
  'Ready for Delivery': 'bg-green-100 text-green-800',
  'Delivered': 'bg-emerald-100 text-emerald-800',
  'Completed': 'bg-gray-100 text-gray-800',
};

function StageBadge({ stage }: { stage: string }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STAGE_COLORS[stage] || 'bg-gray-100 text-gray-800'}`}>
      {stage}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
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

export default function ProjectsPage() {
  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    stage: '',
    status: '',
    staff: '',
    institution: '',
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const { projects, isLoading, error } = useProjects(filters);

  // Get unique values for filter dropdowns
  const [institutions, setInstitutions] = useState<string[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  
  useEffect(() => {
    const uniqueInstitutions = [...new Set(
      projects
        .map(p => p.clients?.institution)
        .filter(Boolean) as string[]
    )].sort();
    setInstitutions(uniqueInstitutions);

    // Extract unique staff members
    const staffMap = new Map();
    projects.forEach(p => {
      p.project_staff?.forEach((ps: any) => {
        if (ps.staff) {
          staffMap.set(ps.staff.id, ps.staff);
        }
      });
    });
    setStaffList(Array.from(staffMap.values()));
  }, [projects]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleFilterChange = (key: keyof ProjectFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      stage: '',
      status: '',
      staff: '',
      institution: '',
    });
  };

  const hasActiveFilters = filters.stage || filters.status || filters.staff || filters.institution;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="mt-1 text-gray-500">
            View and manage client projects.
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
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="mt-1 text-gray-500">
            View and manage client projects.
          </p>
        </div>
        <EmptyState
          icon={<FolderKanban className="h-8 w-8 text-red-500" />}
          title="Error Loading Projects"
          description={error}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
        <p className="mt-1 text-gray-500">
          View and manage client projects ({projects.length} total)
        </p>
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
                placeholder="Search by reference, client name, institution, or assigned staff..."
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t">
                <Select
                  label="Stage"
                  value={filters.stage}
                  onChange={(e) => handleFilterChange('stage', e.target.value)}
                  options={STAGE_OPTIONS}
                />
                <Select
                  label="Status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  options={STATUS_OPTIONS}
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
                <Select
                  label="Assigned Staff"
                  value={filters.staff}
                  onChange={(e) => handleFilterChange('staff', e.target.value)}
                  options={[
                    { value: '', label: 'All Staff' },
                    ...staffList.map(s => ({ value: s.id, label: s.full_name })),
                  ]}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        {projects.length > 0 ? (
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
                    Assigned Staff
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-medium text-brand-green">
                        {project.project_reference}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {project.clients?.full_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {project.clients?.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {project.clients?.institution || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {project.project_staff?.[0]?.staff?.full_name || (
                        <span className="text-sm text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StageBadge stage={project.current_stage} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">
                        {project.start_date ? formatDate(project.start_date) : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">
                        {project.expected_delivery_date ? formatDate(project.expected_delivery_date) : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/workspace/projects/${project.id}`}>
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
              icon={<FolderKanban className="h-8 w-8" />}
              title="No Projects Found"
              description={filters.search || hasActiveFilters 
                ? "No projects match your search criteria. Try adjusting your filters."
                : "No projects yet. Projects are created when support requests are approved."
              }
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
}