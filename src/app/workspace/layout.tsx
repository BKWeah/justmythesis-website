import { WorkspaceShell } from '@/components/layout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Workspace | JUSTmyTHESIS',
    template: '%s | JUSTmyTHESIS Workspace',
  },
  description: 'JUSTmyTHESIS internal workspace for managing client requests and projects.',
};

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceShell>
      {children}
    </WorkspaceShell>
  );
}