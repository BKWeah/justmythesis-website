import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

const Table = ({ className, children, ...props }: TableProps) => (
  <div className="w-full overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
    <table
      className={cn('w-full min-w-[640px] caption-bottom text-sm', className)}
      {...props}
    >
      {children}
    </table>
  </div>
);

export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

const TableHeader = ({ className, children, ...props }: TableHeaderProps) => (
  <thead
    className={cn(
      'border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)]',
      className
    )}
    {...props}
  >
    {children}
  </thead>
);

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

const TableBody = ({ className, children, ...props }: TableBodyProps) => (
  <tbody className={cn('divide-y divide-[var(--border-subtle)] bg-white', className)} {...props}>
    {children}
  </tbody>
);

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  hoverable?: boolean;
}

const TableRow = ({ className, children, hoverable = true, ...props }: TableRowProps) => (
  <tr
    className={cn(
      'transition-colors duration-150',
      hoverable && 'hover:bg-[#FAFBFA]',
      className
    )}
    {...props}
  >
    {children}
  </tr>
);

export interface TableHeadProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

const TableHead = ({ className, children, ...props }: TableHeadProps) => (
  <th
    className={cn(
      'px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]',
      className
    )}
    {...props}
  >
    {children}
  </th>
);

export interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

const TableCell = ({ className, children, ...props }: TableCellProps) => (
  <td
    className={cn('px-5 py-4 align-middle text-[var(--text-primary)]', className)}
    {...props}
  >
    {children}
  </td>
);

export interface TableCaptionProps extends HTMLAttributes<HTMLTableCaptionElement> {
  children: ReactNode;
}

const TableCaption = ({ className, children, ...props }: TableCaptionProps) => (
  <caption className={cn('mt-4 text-sm text-[var(--text-muted)]', className)} {...props}>
    {children}
  </caption>
);

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption };
