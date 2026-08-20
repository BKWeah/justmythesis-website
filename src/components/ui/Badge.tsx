import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { badgeVariants, type BadgeVariant } from '@/lib/theme';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const Badge = ({
  className,
  children,
  variant = 'default',
  size = 'md',
  ...props
}: BadgeProps) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        badgeVariants[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

// Convenience components for common status badges
export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: 'pending' | 'in_review' | 'completed' | 'requires_action' | 'active' | 'inactive';
}

const statusConfig: Record<StatusBadgeProps['status'], { variant: BadgeVariant; label: string }> = {
  pending: { variant: 'warning', label: 'Pending' },
  in_review: { variant: 'info', label: 'In Review' },
  completed: { variant: 'success', label: 'Completed' },
  requires_action: { variant: 'error', label: 'Action Required' },
  active: { variant: 'success', label: 'Active' },
  inactive: { variant: 'default', label: 'Inactive' },
};

const StatusBadge = ({ status, className, ...props }: StatusBadgeProps) => {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={className} {...props}>
      {config.label}
    </Badge>
  );
};

// Project status badges
export interface ProjectStatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: 'inquiry' | 'assessment' | 'active' | 'completed' | 'cancelled';
}

const projectStatusConfig: Record<ProjectStatusBadgeProps['status'], { variant: BadgeVariant; label: string }> = {
  inquiry: { variant: 'default', label: 'Inquiry' },
  assessment: { variant: 'info', label: 'Assessment' },
  active: { variant: 'primary', label: 'Active' },
  completed: { variant: 'success', label: 'Completed' },
  cancelled: { variant: 'error', label: 'Cancelled' },
};

const ProjectStatusBadge = ({ status, className, ...props }: ProjectStatusBadgeProps) => {
  const config = projectStatusConfig[status];
  return (
    <Badge variant={config.variant} className={className} {...props}>
      {config.label}
    </Badge>
  );
};

export { Badge, StatusBadge, ProjectStatusBadge };