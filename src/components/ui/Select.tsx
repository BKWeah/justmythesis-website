'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label ? (
          <label htmlFor={selectId} className="mb-2 block text-sm font-semibold text-[#2F3431]">
            {label}
          </label>
        ) : null}
        <div className="relative">
          <select
            id={selectId}
            className={cn(
              'flex h-11 w-full appearance-none rounded-[var(--radius-md)] border border-[var(--border-default)] bg-white px-3.5 py-2.5 pr-10 text-sm text-[var(--text-primary)] shadow-[0_1px_2px_rgba(16,24,40,0.03)]',
              'transition-[border-color,box-shadow,background-color] duration-200 ease-out',
              'focus:border-brand-green focus:outline-none focus:ring-4 focus:ring-brand-green/10',
              'disabled:cursor-not-allowed disabled:border-[var(--border-subtle)] disabled:bg-[var(--surface-subtle)] disabled:text-gray-500',
              error && 'border-red-400 focus:border-red-500 focus:ring-red-500/10',
              className
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
            ref={ref}
            {...props}
          >
            {placeholder ? <option value="" disabled>{placeholder}</option> : null}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
        </div>
        {error ? <p id={`${selectId}-error`} className="mt-1.5 text-sm text-red-600">{error}</p> : null}
        {hint && !error ? <p id={`${selectId}-hint`} className="mt-1.5 text-sm text-[var(--text-muted)]">{hint}</p> : null}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
