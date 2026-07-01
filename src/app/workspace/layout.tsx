'use client';

import { usePathname } from 'next/navigation';
import { WorkspaceShell } from '@/components/layout';

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // If at login page, render without shell (no auth required)
  if (pathname === '/workspace/login') {
    return <>{children}</>;
  }

  // All other workspace pages use the shell (auth required)
  return <WorkspaceShell>{children}</WorkspaceShell>;
}