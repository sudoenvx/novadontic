import type { HTMLAttributes } from 'react'
import { cn } from 'cn'

export function DataTableFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="data-table-footer"
      className={cn(
        'flex w-full flex-wrap items-center justify-between gap-3 px-4 py-2',
        className,
      )}
      {...props}
    />
  )
}
