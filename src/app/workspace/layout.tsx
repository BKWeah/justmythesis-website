'use client';

import { usePathname } from 'next/navigation';
import { WorkspaceShell } from '@/components/layout';

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // TEST: bypass shell to see if placeholder renders
  return <>{children}</>;
  
  // Login page has its own standalone layout - bypass shell
  if (pathname === '/workspace/login') {
    return <>{children}</>;
  }

  // All other workspace pages use the shell with auth
  return <WorkspaceShell>{children}</WorkspaceShell>;
}