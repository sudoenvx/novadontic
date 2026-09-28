import type { HTMLAttributes } from 'react'

import { cn } from 'cn'

/**
 * DataTableActions
 * ---------------------------------------------------------------------------
 * A flex container for action buttons in the DataTable header area.
 * Aligns to the end, wraps to start on small screens.
 */
export function DataTableActions({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-end gap-2 max-sm:w-full max-sm:justify-start',
        className,
      )}
      {...props}
    />
  )
}
