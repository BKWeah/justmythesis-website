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
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:ring-offset-2"
    >
      <Card
        variant="bordered"
        padding="md"
        className="h-full cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green/40 hover:shadow-md"
      >
        <div className="flex h-full min-h-[220px] flex-col">
          <div className="flex items-start justify-between gap-4">
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                iconBackground
              )}
            >
              <Icon
                className={cn('h-6 w-6', iconColor)}
                aria-hidden="true"
              />
            </div>

            <span className="text-right text-xl font-bold text-foreground">
              {value}
            </span>
          </div>

          <div className="mt-6">
            <h3 className="text-base font-semibold text-foreground">
              {title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="mt-auto flex items-center gap-2 pt-6 text-sm font-semibold text-brand-green">
            <span>{actionLabel}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>
      </Card>
    </button>
  );
}