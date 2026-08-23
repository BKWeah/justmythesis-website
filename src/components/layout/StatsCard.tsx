import { cn } from '@/lib/utils/cn';
import { Card } from '@/components/ui/Card';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function StatsCard({ title, value, subtitle, trend, icon, className }: StatsCardProps) {
  return (
    <Card className={cn('p-5 sm:p-6', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{title}</p>
          <p className="mt-2 text-[2rem] font-semibold leading-none tracking-[-0.04em] text-[var(--text-primary)] sm:text-[2.25rem]">{value}</p>
          {subtitle && <p className="mt-2 text-sm text-[var(--text-secondary)]">{subtitle}</p>}
          {trend && (
            <p className={cn('mt-3 text-xs font-medium', trend.isPositive ? 'text-emerald-700' : 'text-red-600')}>
              {trend.isPositive ? '+' : ''}{trend.value}% from last month
            </p>
          )}
        </div>
        {icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-brand-green/8 text-brand-green">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
