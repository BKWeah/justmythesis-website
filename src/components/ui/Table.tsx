import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

const Table = ({ className, children, ...props }: TableProps) => (
  <div className="w-full overflow-x-auto">
    <table
      className={cn('w-full caption-bottom text-sm', className)}
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
  <thead className={cn('border-b border-gray-200 bg-gray-50/50', className)} {...props}>
    {children}
  </thead>
);

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

const TableBody = ({ className, children, ...props }: TableBodyProps) => (
  <tbody className={cn('divide-y divide-gray-100', className)} {...props}>
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
      'transition-colors',
      hoverable && 'hover:bg-gray-50',
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
      'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
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
    className={cn('px-4 py-3 text-gray-700 align-middle', className)}
    {...props}
  >
    {children}
  </td>
);

export interface TableCaptionProps extends HTMLAttributes<HTMLTableCaptionElement> {
  children: ReactNode;
}

const TableCaption = ({ className, children, ...props }: TableCaptionProps) => (
  <caption className={cn('mt-4 text-sm text-gray-500', className)} {...props}>
    {children}
  </caption>
);

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption };