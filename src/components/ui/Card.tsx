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
    default: 'bg-white rounded-xl border border-gray-100 shadow-sm',
    elevated: 'bg-white rounded-xl shadow-lg border border-gray-100/50',
    bordered: 'bg-white rounded-xl border-2 border-gray-200',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(variantStyles[variant], paddingStyles[padding], className)}
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
  <p className={cn('text-sm text-gray-500 mt-1', className)} {...props}>
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
  <div className={cn('mt-4 pt-4 border-t border-gray-100', className)} {...props}>
    {children}
  </div>
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };