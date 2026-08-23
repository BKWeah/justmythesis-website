'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Settings,
  GraduationCap,
  X,
  Bot,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/workspace/dashboard', icon: LayoutDashboard },
  { name: 'Requests', href: '/workspace/requests', icon: FileText },
  { name: 'Projects', href: '/workspace/projects', icon: FolderKanban },
  { name: 'Support Team', href: '/workspace/support-team', icon: Users },
  { name: 'Operations GPT', href: '/workspace/operations', icon: Bot },
  { name: 'Settings', href: '/workspace/settings', icon: Settings },
];

interface WorkspaceSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const WorkspaceSidebar = ({ collapsed = false, onToggle }: WorkspaceSidebarProps) => {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-[var(--border-subtle)] bg-[var(--surface-card)] transition-[width] duration-200',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      <div className="flex h-20 items-center justify-between border-b border-[var(--border-subtle)] px-4">
        <Link href="/workspace/dashboard" className={cn('flex items-center gap-3 min-w-0', collapsed && 'mx-auto')}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-brand-green/8 text-brand-green">
            <GraduationCap className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold tracking-[-0.02em] text-brand-green">
                JUST<span className="text-gold">my</span>THESIS
              </p>
              <p className="text-xs text-[var(--text-muted)]">Operations Workspace</p>
            </div>
          )}
        </Link>
        {onToggle && !collapsed && (
          <button
            onClick={onToggle}
            className="rounded-[var(--radius-md)] p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
            aria-label="Collapse sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-5">
        {!collapsed && <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Workspace</p>}
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-[var(--radius-lg)] px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-green text-white shadow-[0_4px_14px_rgba(24,69,47,0.14)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon className={cn('h-[18px] w-[18px] shrink-0', isActive ? 'text-white' : 'text-[var(--text-muted)] group-hover:text-brand-green')} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="border-t border-[var(--border-subtle)] px-5 py-4">
          <p className="text-xs text-[var(--text-muted)]">JUSTmyTHESIS Workspace v1.0</p>
        </div>
      )}
    </aside>
  );
};

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar = ({ isOpen, onClose }: MobileSidebarProps) => {
  const pathname = usePathname();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/35 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <aside className="fixed inset-y-0 left-0 flex w-[86vw] max-w-72 flex-col bg-[var(--surface-card)] shadow-[0_20px_50px_rgba(16,24,40,0.18)]">
        <div className="flex h-20 items-center justify-between border-b border-[var(--border-subtle)] px-4">
          <Link href="/workspace/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] bg-brand-green/8 text-brand-green">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-brand-green">JUST<span className="text-gold">my</span>THESIS</p>
              <p className="text-xs text-[var(--text-muted)]">Operations Workspace</p>
            </div>
          </Link>
          <button onClick={onClose} className="rounded-[var(--radius-md)] p-2 text-[var(--text-muted)] hover:bg-[var(--surface-subtle)]" aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} onClick={onClose} className={cn('flex items-center gap-3 rounded-[var(--radius-lg)] px-3 py-2.5 text-sm font-medium transition-colors', isActive ? 'bg-brand-green text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]')}>
                <Icon className={cn('h-[18px] w-[18px]', isActive ? 'text-white' : 'text-[var(--text-muted)]')} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
};

export { WorkspaceSidebar, MobileSidebar };
