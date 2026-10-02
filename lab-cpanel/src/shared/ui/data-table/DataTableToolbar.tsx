import type { HTMLAttributes } from 'react'
import { cn } from 'cn'

type DataTableToolbarProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'filters' | 'selection'
}

export function DataTableToolbar({
  className,
  variant = 'filters',
  ...props
}: DataTableToolbarProps) {
  return (
    <div
      data-slot="data-table-toolbar"
      data-variant={variant}
      className={cn(
        'flex flex-wrap items-center gap-2 px-2 py-2',
        variant === 'filters'
          ? 'border-b border-border-subtle bg-neutral-50'
          : 'border-b border-border-subtle bg-neutral-50',
        className,
      )}
      {...props}
    />
  )
}
