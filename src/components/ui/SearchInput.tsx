'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
  showClearButton?: boolean;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, showClearButton = true, value, ...props }, ref) => {
    const hasValue = value !== undefined && value !== '';

    return (
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="search"
          className={cn(
            'flex h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-10 py-2 text-sm',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
            'transition-colors duration-200',
            className
          )}
          ref={ref}
          value={value}
          {...props}
        />
        {showClearButton && hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export { SearchInput };