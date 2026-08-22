'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label ? (
          <label htmlFor={textareaId} className="mb-2 block text-sm font-semibold text-[#2F3431]">
            {label}
          </label>
        ) : null}
        <textarea
          id={textareaId}
          className={cn(
            'flex min-h-[128px] w-full resize-y rounded-[var(--radius-md)] border border-[var(--border-default)] bg-white px-3.5 py-3 text-sm text-[var(--text-primary)] shadow-[0_1px_2px_rgba(16,24,40,0.03)]',
            'placeholder:text-[#9AA19C]',
            'transition-[border-color,box-shadow,background-color] duration-200 ease-out',
            'focus:border-brand-green focus:outline-none focus:ring-4 focus:ring-brand-green/10',
            'disabled:cursor-not-allowed disabled:border-[var(--border-subtle)] disabled:bg-[var(--surface-subtle)] disabled:text-gray-500',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-500/10',
            className
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
          ref={ref}
          {...props}
        />
        {error ? <p id={`${textareaId}-error`} className="mt-1.5 text-sm text-red-600">{error}</p> : null}
        {hint && !error ? <p id={`${textareaId}-hint`} className="mt-1.5 text-sm text-[var(--text-muted)]">{hint}</p> : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
