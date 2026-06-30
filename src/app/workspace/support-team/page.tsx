import { Metadata } from 'next';
import { Users } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export const metadata: Metadata = {
  title: 'Support Team',
  description: 'JUSTmyTHESIS support team management.',
};

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Support Team</h2>
        <p className="mt-1 text-gray-500">
          Manage your support team members and assignments.
        </p>
      </div>

      <EmptyState
        icon={<Users className="h-8 w-8" />}
        title="Support Team Coming Soon"
        description="This feature is currently under development. You will be able to manage team members, assign requests, and track workload."
      />
    </div>
  );
}