'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { WorkspaceSidebar, MobileSidebar } from './WorkspaceSidebar';
import { WorkspaceHeader } from './WorkspaceHeader';

interface StaffUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface WorkspaceShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

const WorkspaceShell = ({ children, title, subtitle }: WorkspaceShellProps) => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState<StaffUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      if (data.staff) setUser(data.staff);
      else if (!data.user) router.push('/workspace/login');
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/workspace/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface-page)]">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--border-default)] border-t-brand-green" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[var(--surface-page)]">
      <div className="hidden lg:block lg:shrink-0">
        <WorkspaceSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      <MobileSidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <WorkspaceHeader
          title={title}
          subtitle={subtitle}
          user={{ name: user.full_name, email: user.email, role: user.role }}
          onLogout={handleLogout}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 xl:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export { WorkspaceShell };
