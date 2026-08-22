import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = ({
  className,
  children,
  variant = 'default',
  padding = 'md',
  ...props
}: CardProps) => {
  const variantStyles = {
    default:
      'bg-white rounded-[var(--radius-xl)] border border-gray-200/70 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_4px_12px_rgba(16,24,40,0.04)]',
    elevated:
      'bg-white rounded-[var(--radius-xl)] border border-gray-200/60 shadow-[0_8px_24px_rgba(16,24,40,0.08)]',
    bordered:
      'bg-white rounded-[var(--radius-xl)] border border-gray-200 shadow-none',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'transition-[box-shadow,border-color,transform] duration-200 ease-out',
        variantStyles[variant],
        paddingStyles[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const CardHeader = ({ className, children, ...props }: CardHeaderProps) => (
  <div className={cn('mb-4', className)} {...props}>
    {children}
  </div>
);

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}

const CardTitle = ({
  className,
  children,
  as: Component = 'h3',
  ...props
}: CardTitleProps) => (
  <Component
    className={cn('text-lg font-semibold text-gray-900', className)}
    {...props}
  >
    {children}
  </Component>
);

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

const CardDescription = ({ className, children, ...props }: CardDescriptionProps) => (
  <p className={cn('mt-1 text-sm text-gray-500', className)} {...props}>
    {children}
  </p>
);

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const CardContent = ({ className, children, ...props }: CardContentProps) => (
  <div className={cn('', className)} {...props}>
    {children}
  </div>
);

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const CardFooter = ({ className, children, ...props }: CardFooterProps) => (
  <div className={cn('mt-4 border-t border-gray-100 pt-4', className)} {...props}>
    {children}
  </div>
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
