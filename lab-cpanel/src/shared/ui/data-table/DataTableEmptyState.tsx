import type { ReactNode } from 'react'
import { cn } from 'cn'

type DataTableEmptyStateProps = {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}

export function DataTableEmptyState({
  action,
  className,
  description,
  title = 'No records found.',
}: DataTableEmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        'grid min-h-52 place-content-center justify-items-center gap-2 px-4 py-8 text-center',
        className,
      )}
    >
      <p className="text-base font-semibold text-text-primary">{title}</p>
      {description && (
        <p className="max-w-prose text-sm text-text-secondary">{description}</p>
      )}
      {action}
    </div>
  )
}
