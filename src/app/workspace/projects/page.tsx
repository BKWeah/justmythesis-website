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
import { Search, Filter, FolderKanban, ArrowRight, ChevronDown } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';

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

const stageVariant: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'info'> = {
  Initiated: 'info',
  Research: 'primary',
  Writing: 'warning',
  Review: 'warning',
  'Quality Assurance': 'info',
  'Ready for Delivery': 'success',
  Delivered: 'success',
  Completed: 'default',
};

function StageBadge({ stage }: { stage: string }) {
  return <Badge variant={stageVariant[stage] || 'default'}>{stage}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
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

export default function ProjectsPage() {
  const [filters, setFilters] = useState<ProjectFilters>({ search: '', stage: '', status: '', staff: '', institution: '' });
  const [showFilters, setShowFilters] = useState(false);
  const { projects, isLoading, error } = useProjects(filters);
  const [institutions, setInstitutions] = useState<string[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);

  useEffect(() => {
    setInstitutions([...new Set(projects.map(p => p.clients?.institution).filter(Boolean) as string[])].sort());
    const staffMap = new Map();
    projects.forEach(p => p.project_staff?.forEach((ps: any) => ps.staff && staffMap.set(ps.staff.id, ps.staff)));
    setStaffList(Array.from(staffMap.values()));
  }, [projects]);

  const clearFilters = () => setFilters({ search: '', stage: '', status: '', staff: '', institution: '' });
  const hasActiveFilters = Boolean(filters.stage || filters.status || filters.staff || filters.institution);

  if (isLoading) return <LoadingState />;
  if (error) return <EmptyState icon={<FolderKanban className="h-8 w-8 text-red-500" />} title="Error Loading Projects" description={error} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-green/70">Delivery portfolio</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-gray-950">Projects</h2>
          <p className="mt-2 text-sm text-gray-500">Track active client engagements, progress and delivery status.</p>
        </div>
        <div className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 shadow-sm">{projects.length} total</div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="border-b border-gray-100 p-4 sm:p-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={filters.search} onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))} placeholder="Search reference, client, institution or assigned staff" className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-white pl-10 pr-4 text-sm text-gray-900 shadow-sm outline-none transition focus:border-brand-green focus:ring-4 focus:ring-brand-green/10" />
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
              <Select label="Stage" value={filters.stage} onChange={(e) => setFilters(prev => ({ ...prev, stage: e.target.value }))} options={STAGE_OPTIONS} />
              <Select label="Status" value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))} options={STATUS_OPTIONS} />
              <Select label="Institution" value={filters.institution} onChange={(e) => setFilters(prev => ({ ...prev, institution: e.target.value }))} options={[{ value: '', label: 'All Institutions' }, ...institutions.map(i => ({ value: i, label: i }))]} />
              <Select label="Assigned Staff" value={filters.staff} onChange={(e) => setFilters(prev => ({ ...prev, staff: e.target.value }))} options={[{ value: '', label: 'All Staff' }, ...staffList.map(s => ({ value: s.id, label: s.full_name }))]} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden" padding="none">
        {projects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[var(--surface-subtle)]">
                <tr className="border-b border-[var(--border-subtle)]">
                  {['Reference','Client','Institution','Assigned Staff','Stage','Status','Start Date','Target','Action'].map(label => <th key={label} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">{label}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] bg-white">
                {projects.map(project => (
                  <tr key={project.id} className="transition-colors hover:bg-[var(--surface-subtle)]/70">
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-brand-green">{project.project_reference}</td>
                    <td className="px-5 py-4"><p className="font-medium text-gray-900">{project.clients?.full_name || 'Unknown'}</p><p className="mt-0.5 text-xs text-gray-500">{project.clients?.email}</p></td>
                    <td className="px-5 py-4 text-gray-600">{project.clients?.institution || '-'}</td>
                    <td className="px-5 py-4 text-gray-600">{project.project_staff?.[0]?.staff?.full_name || <span className="text-gray-400">Unassigned</span>}</td>
                    <td className="px-5 py-4"><StageBadge stage={project.current_stage} /></td>
                    <td className="px-5 py-4"><StatusBadge status={project.status} /></td>
                    <td className="px-5 py-4 text-gray-500">{project.start_date ? formatDate(project.start_date) : '-'}</td>
                    <td className="px-5 py-4 text-gray-500">{project.expected_delivery_date ? formatDate(project.expected_delivery_date) : '-'}</td>
                    <td className="px-5 py-4"><Link href={`/workspace/projects/${project.id}`}><Button variant="ghost" size="sm">Open <ArrowRight className="h-4 w-4" /></Button></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8"><EmptyState icon={<FolderKanban className="h-8 w-8" />} title="No Projects Found" description={filters.search || hasActiveFilters ? 'No projects match your current search or filters.' : 'Approved client projects will appear here.'} /></div>
        )}
      </Card>
    </div>
  );
}