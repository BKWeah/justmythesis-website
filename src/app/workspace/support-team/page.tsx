'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Mail, RefreshCw, Search, ShieldCheck, UserRound, Users } from 'lucide-react';
import { Badge, Button, Card, Input, LoadingState } from '@/components/ui';

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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Support Team</h1>
              <p className="mt-1 text-gray-500">View staff accounts available for project assignment and operational oversight.</p>
            </div>
          </div>
        </div>
        <Button variant="secondary" onClick={() => void loadStaff()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-gray-500">Total Staff</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{staff.length}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-500">Roles Represented</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{new Set(staff.map((member) => member.role)).size}</p>
        </Card>
        <Card>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 text-brand-green" />
            <div>
              <p className="font-semibold text-gray-900">Assignment Ready</p>
              <p className="mt-1 text-sm text-gray-500">These staff accounts are available to project-level team assignment.</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Staff Directory</h2>
            <p className="mt-1 text-sm text-gray-500">Search by staff name, email address or operational role.</p>
          </div>
          <div className="w-full sm:max-w-sm">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search support team..."
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {isLoading ? (
          <LoadingState />
        ) : filteredStaff.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 px-6 py-12 text-center">
            <Users className="mx-auto h-8 w-8 text-gray-400" />
            <h3 className="mt-3 font-semibold text-gray-900">No staff found</h3>
            <p className="mt-1 text-sm text-gray-500">No staff accounts match the current search.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredStaff.map((member) => (
              <div key={member.id} className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900">{member.full_name || 'Unnamed Staff Member'}</p>
                    <div className="mt-2"><Badge variant="info">{member.role || 'Staff'}</Badge></div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
