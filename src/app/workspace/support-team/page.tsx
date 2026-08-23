'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Mail, RefreshCw, Search, ShieldCheck, UserRound, Users } from 'lucide-react';
import { Badge, Button, Card, LoadingState } from '@/components/ui';

type StaffMember = {
  id: string;
  full_name: string;
  email: string;
  role: string;
};

type StaffResponse = {
  staff?: StaffMember[];
  error?: string;
};

export default function TeamPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStaff = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/staff', {
        credentials: 'include',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      const data = (await response.json()) as StaffResponse;
      if (!response.ok) throw new Error(data.error || 'Unable to load support team.');
      setStaff(data.staff ?? []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load support team.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return staff;
    return staff.filter((member) =>
      [member.full_name, member.email, member.role].some((value) =>
        value?.toLowerCase().includes(query)
      )
    );
  }, [search, staff]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold-dark">Operations Workspace</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-950">Support Team</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">Staff accounts available for project assignment, specialist support and operational oversight.</p>
        </div>
        <Button variant="secondary" onClick={() => void loadStaff()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm font-medium text-gray-500">Total Staff</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-950">{staff.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium text-gray-500">Roles Represented</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-950">{new Set(staff.map((member) => member.role)).size}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-brand-green/10 p-2.5 text-brand-green"><ShieldCheck className="h-5 w-5" /></div>
            <div>
              <p className="font-semibold text-gray-950">Assignment Ready</p>
              <p className="mt-1 text-sm leading-6 text-gray-500">Available for project-level team assignment.</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-950">Staff Directory</h2>
            <p className="mt-1 text-sm text-gray-500">Search by name, email or operational role.</p>
          </div>
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search support team..."
              className="h-11 w-full rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-white pl-10 pr-3 text-sm outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/15"
            />
          </div>
        </div>

        <div className="p-5 md:p-6">
          {error && (
            <div className="mb-5 rounded-[var(--radius-lg)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          {isLoading ? (
            <LoadingState />
          ) : filteredStaff.length === 0 ? (
            <div className="rounded-[var(--radius-xl)] border border-dashed border-gray-300 bg-[var(--surface-subtle)] px-6 py-12 text-center">
              <Users className="mx-auto h-8 w-8 text-gray-400" />
              <h3 className="mt-3 font-semibold text-gray-950">No staff found</h3>
              <p className="mt-1 text-sm text-gray-500">No staff accounts match the current search.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredStaff.map((member) => (
                <div key={member.id} className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
                      <UserRound className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-950">{member.full_name || 'Unnamed Staff Member'}</p>
                      <div className="mt-2"><Badge variant="info">{member.role || 'Staff'}</Badge></div>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
                    <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="truncate">{member.email}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
