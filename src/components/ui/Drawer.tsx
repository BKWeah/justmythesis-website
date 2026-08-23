'use client';

import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  position?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  size = 'md',
  showCloseButton = true,
}: DrawerProps) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-xs',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  };

  const positionStyles = {
    left: 'inset-y-0 left-0 border-r rounded-r-[var(--radius-2xl)]',
    right: 'inset-y-0 right-0 border-l rounded-l-[var(--radius-2xl)]',
  };

  const drawerContent = (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-[#17211b]/45 backdrop-blur-[2px] transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          'absolute flex h-full w-full flex-col border-gray-200/80 bg-white shadow-[0_20px_70px_rgba(16,24,40,0.16)]',
          positionStyles[position],
          sizeStyles[size],
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
      >
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6 sm:py-5">
          {title ? (
            <h2 id="drawer-title" className="text-xl font-semibold tracking-[-0.025em] text-gray-950">
              {title}
            </h2>
          ) : (
            <span />
          )}

          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/30"
              aria-label="Close drawer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {children}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(drawerContent, document.body)
    : null;
};

export { Drawer };
