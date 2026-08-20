'use client';

import { useState } from 'react';
import { Menu, Bell, LogOut, User, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
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
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Page title */}
          <div>
            {title && (
              <h1 className="text-lg md:text-xl font-semibold text-gray-900">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 hidden md:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search (hidden on mobile) */}
          <div className="hidden md:block w-64 lg:w-80">
            <SearchInput
              placeholder="Search..."
              className="bg-gray-50"
            />
          </div>

          {/* Notifications */}
          <button
            className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {/* Notification dot */}
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="User menu"
            >
              <div className="hidden md:flex items-center justify-center h-8 w-8 bg-brand-green text-white rounded-full">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-gray-700">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role || 'Client'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 hidden lg:block" />
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {user?.email && (
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout?.();
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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