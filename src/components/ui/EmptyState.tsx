import { type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const EmptyState = ({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        'flex min-h-[280px] flex-col items-center justify-center rounded-[var(--radius-2xl)] border border-dashed border-gray-200 bg-white/70 px-6 py-12 text-center sm:px-10',
        className,
      )}
    >
      {icon && (
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[var(--radius-xl)] bg-brand-green/7 text-brand-green ring-1 ring-brand-green/10">
          {icon}
        </div>
      )}

      <h3 className="text-xl font-semibold tracking-[-0.025em] text-gray-950">
        {title}
      </h3>

      {description && (
        <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
          {description}
        </p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export { EmptyState };
