'use client';

import { ArrowRight, type LucideIcon } from 'lucide-react';

import { Card } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

interface DashboardStatCardProps {
  title: string;
  description: string;
  value: string | number;
  actionLabel: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBackground?: string;
  onClick?: () => void;
}

export function DashboardStatCard({
  title,
  description,
  value,
  actionLabel,
  icon: Icon,
  iconColor = 'text-brand-green',
  iconBackground = 'bg-brand-green/10',
  onClick,
}: DashboardStatCardProps) {
  const isInteractive = Boolean(onClick);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isInteractive}
      className="group w-full rounded-[var(--radius-xl)] text-left outline-none disabled:cursor-default focus-visible:ring-2 focus-visible:ring-brand-green/40 focus-visible:ring-offset-2"
    >
      <Card
        variant="bordered"
        padding="md"
        className={cn(
          'h-full border-[var(--border-subtle)] bg-white transition-[transform,box-shadow,border-color] duration-200',
          isInteractive && 'cursor-pointer group-hover:-translate-y-0.5 group-hover:border-brand-green/25 group-hover:shadow-[0_10px_24px_rgba(16,24,40,0.07)]'
        )}
      >
        <div className="flex min-h-[190px] h-full flex-col">
          <div className="flex items-start justify-between gap-5">
            <div
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)]',
                iconBackground
              )}
            >
              <Icon className={cn('h-5 w-5', iconColor)} aria-hidden="true" />
            </div>

            <span className="text-right text-xl font-bold text-[var(--text-primary)]">
              {value}
            </span>
          </div>

          <div className="mt-5">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              {title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              {description}
            </p>
          </div>

          <div className="mt-auto flex items-center gap-2 pt-5 text-sm font-semibold text-brand-green">
            <span>{actionLabel}</span>
            <ArrowRight
              className={cn('h-4 w-4 transition-transform', isInteractive && 'group-hover:translate-x-0.5')}
              aria-hidden="true"
            />
          </div>
        </div>
      </Card>
    </button>
  );
}