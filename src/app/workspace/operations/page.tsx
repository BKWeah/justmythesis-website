import { Metadata } from 'next';
import { Bot } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export const metadata: Metadata = {
  title: 'Operations GPT',
  description: 'AI-powered assistant for JUSTmyTHESIS operations.',
};

export default function OperationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Operations GPT</h2>
        <p className="mt-1 text-gray-500">
          AI-powered assistant for JUSTmyTHESIS operations.
        </p>
      </div>

      <EmptyState
        icon={<Bot className="h-8 w-8" />}
        title="Operations GPT Coming Soon"
        description="This feature is currently under development. The AI assistant will help with client communications, request processing, and project management tasks."
      />
    </div>
  );
}