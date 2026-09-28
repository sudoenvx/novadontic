import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from 'cn'

export type ListProps = HTMLAttributes<HTMLDivElement> & {
  title: ReactNode
  content: ReactNode
}

export function List({ title, content, className, ...props }: ListProps) {
  return (
    <div
      data-slot="list-item"
      className={cn(
        'grid min-w-0 grid-cols-[minmax(0,4.5rem)_minmax(0,1fr)] gap-x-2 text-sm [&>*:first-child]:min-w-0 [&>*:first-child]:text-text-secondary [&>*:last-child]:min-w-0 [&>*:last-child]:font-medium [&>*:last-child]:text-text-primary',
        className,
      )}
      {...props}
    >
      {title}
      {content}
    </div>
  )
}