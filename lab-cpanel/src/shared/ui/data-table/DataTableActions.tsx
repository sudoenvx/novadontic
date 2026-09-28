import type { HTMLAttributes } from 'react'

import { cn } from 'cn'

export function DataTableActions({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-wrap items-center justify-end gap-2 max-sm:w-full max-sm:justify-start', className)}
      {...props}
    />
  )
}
