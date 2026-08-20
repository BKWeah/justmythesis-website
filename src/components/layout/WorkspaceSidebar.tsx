'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  FolderKanban, 
  Settings,
  GraduationCap,
  Menu,
  X,
  Bot,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useState } from 'react';

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
        'flex flex-col bg-white border-r border-gray-200 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo / Brand */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {!collapsed && (
          <Link href="/workspace/dashboard" className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-brand-green" />
            <span className="font-semibold text-brand-green text-lg">
              JUST<span className="text-gold">my</span>THESIS
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href="/workspace/dashboard" className="mx-auto">
            <GraduationCap className="h-7 w-7 text-brand-green" />
          </Link>
        )}
        {onToggle && (
          <button
            onClick={onToggle}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Toggle sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-brand-green text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={cn(
                  'h-5 w-5 flex-shrink-0',
                  isActive ? 'text-white' : 'text-gray-400'
                )}
              />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            Workspace v1.0
          </p>
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link href="/workspace/dashboard" className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-brand-green" />
            <span className="font-semibold text-brand-green text-lg">
              JUST<span className="text-gold">my</span>THESIS
            </span>
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-brand-green text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-white' : 'text-gray-400'
                  )}
                />
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