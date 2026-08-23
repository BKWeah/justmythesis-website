'use client';

import { useState } from 'react';
import { Menu, Bell, LogOut, User, ChevronDown } from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';

interface WorkspaceHeaderProps {
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
  user?: {
    name?: string;
    email?: string;
    role?: string;
  };
  onLogout?: () => void;
}

const WorkspaceHeader = ({
  title,
  subtitle,
  onMenuClick,
  user,
  onLogout,
}: WorkspaceHeaderProps) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 md:gap-4">
          <button
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-gray-500 transition-colors hover:bg-[var(--surface-subtle)] hover:text-gray-800 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            {title && (
              <h1 className="truncate text-lg font-semibold tracking-[-0.025em] text-gray-950 md:text-xl">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-0.5 hidden truncate text-sm text-gray-500 md:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 md:gap-3">
          <div className="hidden w-56 md:block lg:w-72 xl:w-80">
            <SearchInput placeholder="Search workspace" className="bg-[var(--surface-subtle)]" />
          </div>

          <button
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-gray-500 transition-colors hover:bg-[var(--surface-subtle)] hover:text-gray-800"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex min-h-10 items-center gap-2 rounded-[var(--radius-md)] px-1.5 py-1 text-gray-600 transition-colors hover:bg-[var(--surface-subtle)] hover:text-gray-900 md:px-2"
              aria-label="User menu"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-green text-white shadow-sm">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden max-w-36 text-left lg:block">
                <p className="truncate text-sm font-medium text-gray-800">
                  {user?.name || 'User'}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {user?.role || 'Client'}
                </p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-gray-400 lg:block" />
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-white py-1 shadow-[0_16px_40px_rgba(16,24,40,0.14)]">
                  {user?.email && (
                    <div className="border-b border-[var(--border-subtle)] px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{user.name || 'User'}</p>
                      <p className="mt-0.5 truncate text-xs text-gray-500">{user.email}</p>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout?.();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-[var(--surface-subtle)]"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export { WorkspaceHeader };
