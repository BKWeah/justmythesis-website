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
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            className={cn(
              'flex h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-10 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
              'transition-colors duration-200',
              error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
              className
            )}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-600">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };