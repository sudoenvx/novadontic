import type { ReactNode } from 'react'
import { cn } from 'cn'

import { List } from './List'

export type DescriptionListItem = {
  id: string
  title: ReactNode
  description: ReactNode
}

type DescriptionListProps = {
  items: DescriptionListItem[]
  className?: string
  itemClassName?: string
}

export function DescriptionList({ items, className, itemClassName }: DescriptionListProps) {
  return (
    <dl className={cn('grid gap-2', className)}>
      {items.map((item) => (
        <List
          key={item.id}
          title={<dt>{item.title}</dt>}
          content={<dd>{item.description}</dd>}
          className={itemClassName}
        />
      ))}
    </dl>
  )
}