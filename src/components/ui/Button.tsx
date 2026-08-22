'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import { buttonVariants, type ButtonVariant } from '@/lib/theme';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = [
      'inline-flex items-center justify-center gap-2 whitespace-nowrap',
      'rounded-[var(--radius-lg)] font-semibold tracking-[-0.01em]',
      'transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/35 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:cursor-not-allowed',
      'active:translate-y-px',
    ].join(' ');

    const sizeStyles = {
      sm: 'h-9 px-3.5 text-sm',
      md: 'h-11 px-4.5 text-sm',
      lg: 'h-12 px-6 text-base',
    };

    const variantConfig = buttonVariants[variant];
    const variantStyles = `${variantConfig.base} ${variantConfig.active} ${variantConfig.disabled}`;

    return (
      <button
        className={cn(baseStyles, sizeStyles[size], variantStyles, className)}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading ? (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
