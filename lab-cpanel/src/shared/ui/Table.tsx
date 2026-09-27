import { cn } from 'cn'
import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import React from 'react'

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return <table className={cn('w-full text-start text-sm', className)} {...props} />
}

export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-muted text-text-muted', className)} {...props} />
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('[&_tr>td]:border-b [&_tr>td]:border-border-soft [&_tr:hover>td]:bg-neutral-50', className)} {...props} />
}

export const TableRow = React.forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => <tr ref={ref} className={cn('group', className)} {...props} />,
)
TableRow.displayName = 'TableRow'

export function TableHead({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn('whitespace-nowrap px-2.5 pb-1 text-start align-middle text-sm font-medium', className)} {...props} />
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('whitespace-nowrap px-2.5 py-2 first:rounded-l-sm last:rounded-r-sm', className)} {...props} />
}
