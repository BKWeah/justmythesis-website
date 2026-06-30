import { Metadata } from 'next';
import { Settings as SettingsIcon } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your workspace settings and preferences.',
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="mt-1 text-gray-500">
          Manage your workspace settings and preferences.
        </p>
      </div>

      <EmptyState
        icon={<SettingsIcon className="h-8 w-8" />}
        title="Settings Coming Soon"
        description="Configure your workspace preferences, notification settings, and account information."
      />
    </div>
  );
}