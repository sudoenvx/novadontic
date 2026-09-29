import { cn } from 'cn'
import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import React from 'react'

/**
 * TABLE
 * ---------------------------------------------------------------------------
 * Semantic table primitives that respect the design system.
 *
 * Usage:
 *   <Table>
 *     <TableHeader>
 *       <TableRow>
 *         <TableHead>Name</TableHead>
 *       </TableRow>
 *     </TableHeader>
 *     <TableBody>
 *       <TableRow>
 *         <TableCell>Alice</TableCell>
 *       </TableRow>
 *     </TableBody>
 *   </Table>
 *
 * Styling follows the design system's .table class semantics:
 *   - Header: sentence-case, text-secondary, xs font, bold
 *   - Rows: h-row (40px), border-top on border-soft, hover → surface-soft
 *   - Cells: 0.75rem padding, base font size
 */

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn('w-full border-collapse text-start text-base', className)}
      {...props}
    />
  )
}

export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn('bg-surface-muted text-text-secondary', className)}
      {...props}
    />
  )
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn(
        '[&_tr>td]:border-t [&_tr>td]:border-border-soft [&_tr:hover>td]:bg-surface-soft transition-colors',
        className,
      )}
      {...props}
    />
  )
}

export const TableRow = React.forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn('group', className)} {...props} />
  ),
)
TableRow.displayName = 'TableRow'

export function TableHead({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'whitespace-nowrap px-3 py-2 text-start align-middle text-xs font-bold text-text-secondary',
        className,
      )}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        'h-row whitespace-nowrap px-3 align-middle ',
        className,
      )}
      {...props}
    />
  )
}
