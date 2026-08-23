'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bell, Save, Settings as SettingsIcon, ShieldCheck, UserRound } from 'lucide-react';
import { Button, Card, Input, LoadingState, Select } from '@/components/ui';

type SettingsResponse = {
  success?: boolean;
  profile?: { id: string; fullName: string; email: string; role: string };
  preferences?: {
    emailNotifications: boolean;
    projectUpdates: boolean;
    requestUpdates: boolean;
    qaAlerts: boolean;
    compactMode: boolean;
    itemsPerPage: number;
  };
  error?: string;
};

type FormState = {
  fullName: string;
  email: string;
  role: string;
  emailNotifications: boolean;
  projectUpdates: boolean;
  requestUpdates: boolean;
  qaAlerts: boolean;
  compactMode: boolean;
  itemsPerPage: number;
};

const EMPTY_FORM: FormState = {
  fullName: '', email: '', role: '', emailNotifications: true, projectUpdates: true,
  requestUpdates: true, qaAlerts: true, compactMode: false, itemsPerPage: 25,
};

function ToggleRow({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-6 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-white p-4 transition hover:border-[var(--border-default)]">
      <div>
        <p className="font-medium text-gray-950">{title}</p>
        <p className="mt-1 text-sm leading-6 text-gray-500">{description}</p>
      </div>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-5 w-5 rounded border-gray-300 text-brand-green focus:ring-brand-green" />
    </label>
  );
}

export default function SettingsPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true); setError(null);
      const response = await fetch('/api/settings', { credentials: 'include', cache: 'no-store', headers: { Accept: 'application/json' } });
      const data = (await response.json()) as SettingsResponse;
      if (!response.ok || !data.profile || !data.preferences) throw new Error(data.error || 'Unable to load workspace settings.');
      setForm({
        fullName: data.profile.fullName, email: data.profile.email, role: data.profile.role,
        emailNotifications: data.preferences.emailNotifications, projectUpdates: data.preferences.projectUpdates,
        requestUpdates: data.preferences.requestUpdates, qaAlerts: data.preferences.qaAlerts,
        compactMode: data.preferences.compactMode, itemsPerPage: data.preferences.itemsPerPage,
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load workspace settings.');
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { void loadSettings(); }, [loadSettings]);

  const saveSettings = async () => {
    try {
      setIsSaving(true); setError(null); setSuccess(null);
      const response = await fetch('/api/settings', {
        method: 'PUT', credentials: 'include', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const data = (await response.json()) as SettingsResponse;
      if (!response.ok) throw new Error(data.error || 'Unable to save workspace settings.');
      setSuccess('Workspace settings saved successfully.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save workspace settings.');
    } finally { setIsSaving(false); }
  };

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold-dark">Workspace Controls</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-950">Settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">Manage your account details, workspace preferences and operational notifications.</p>
      </div>

      {error && <div className="rounded-[var(--radius-lg)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-[var(--radius-lg)] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <div className="mb-6 flex items-start gap-3">
            <div className="rounded-xl bg-brand-green/10 p-2.5 text-brand-green"><UserRound className="h-5 w-5" /></div>
            <div><h2 className="text-lg font-semibold text-gray-950">Account Information</h2><p className="mt-1 text-sm text-gray-500">Update the display name used across the workspace.</p></div>
          </div>
          <div className="space-y-4">
            <Input label="Full Name" value={form.fullName} onChange={(event) => setForm((previous) => ({ ...previous, fullName: event.target.value }))} disabled={isSaving} />
            <Input label="Email Address" value={form.email} disabled hint="Email changes are managed through authentication administration." />
            <Input label="Workspace Role" value={form.role} disabled />
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-6 flex items-start gap-3">
            <div className="rounded-xl bg-brand-green/10 p-2.5 text-brand-green"><ShieldCheck className="h-5 w-5" /></div>
            <div><h2 className="text-lg font-semibold text-gray-950">Workspace Preferences</h2><p className="mt-1 text-sm text-gray-500">Control how operational information is displayed.</p></div>
          </div>
          <div className="space-y-4">
            <Select
              label="Items Per Page"
              value={String(form.itemsPerPage)}
              onChange={(event) => setForm((previous) => ({ ...previous, itemsPerPage: Number(event.target.value) }))}
              options={[{ value: '10', label: '10 items' }, { value: '25', label: '25 items' }, { value: '50', label: '50 items' }]}
              disabled={isSaving}
            />
            <ToggleRow title="Compact workspace layout" description="Use denser spacing in operational lists and tables where supported." checked={form.compactMode} onChange={(checked) => setForm((previous) => ({ ...previous, compactMode: checked }))} />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-6 flex items-start gap-3">
          <div className="rounded-xl bg-brand-green/10 p-2.5 text-brand-green"><Bell className="h-5 w-5" /></div>
          <div><h2 className="text-lg font-semibold text-gray-950">Notification Preferences</h2><p className="mt-1 text-sm text-gray-500">Choose which operational events should generate staff notifications.</p></div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <ToggleRow title="Email notifications" description="Allow workspace notifications to be delivered by email when email delivery is enabled." checked={form.emailNotifications} onChange={(checked) => setForm((previous) => ({ ...previous, emailNotifications: checked }))} />
          <ToggleRow title="Project updates" description="Receive notifications for important project status and delivery changes." checked={form.projectUpdates} onChange={(checked) => setForm((previous) => ({ ...previous, projectUpdates: checked }))} />
          <ToggleRow title="Support request updates" description="Receive notifications when support requests require operational attention." checked={form.requestUpdates} onChange={(checked) => setForm((previous) => ({ ...previous, requestUpdates: checked }))} />
          <ToggleRow title="Quality assurance alerts" description="Receive notifications for QA reviews, findings and approval events." checked={form.qaAlerts} onChange={(checked) => setForm((previous) => ({ ...previous, qaAlerts: checked }))} />
        </div>
      </Card>

      <div className="flex justify-end border-t border-gray-200 pt-6">
        <Button onClick={saveSettings} disabled={isSaving || !form.fullName.trim()}>
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
