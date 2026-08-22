'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, type = 'text', ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label ? (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-semibold text-[#2F3431]"
          >
            {label}
          </label>
        ) : null}
        <input
          id={inputId}
          type={type}
          className={cn(
            'flex h-11 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-white px-3.5 py-2.5 text-sm text-[var(--text-primary)] shadow-[0_1px_2px_rgba(16,24,40,0.03)]',
            'placeholder:text-[#9AA19C]',
            'transition-[border-color,box-shadow,background-color] duration-200 ease-out',
            'focus:border-brand-green focus:outline-none focus:ring-4 focus:ring-brand-green/10',
            'disabled:cursor-not-allowed disabled:border-[var(--border-subtle)] disabled:bg-[var(--surface-subtle)] disabled:text-gray-500',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-500/10',
            className
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          ref={ref}
          {...props}
        />
        {error ? (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600">{error}</p>
        ) : null}
        {hint && !error ? (
          <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-[var(--text-muted)]">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
