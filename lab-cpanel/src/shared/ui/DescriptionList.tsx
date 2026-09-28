import type { ComponentProps } from 'react'
import { cn } from 'cn'

import { List, ListItem } from './List'

export type DescriptionListProps = ComponentProps<'dl'>
export type DescriptionItemProps = ComponentProps<'div'>

export function DescriptionList({ className, ...props }: DescriptionListProps) {
  return (
    <List
      as="dl"
      className={cn('grid gap-2', className)}
      {...props}
    />
  )
}

export function DescriptionItem({ className, ...props }: DescriptionItemProps) {
  return (
    <ListItem
      as="div"
      data-slot="description-item"
      className={cn(
        'grid grid-cols-[minmax(0,4.5rem)_minmax(0,1fr)] gap-x-2',
        className,
      )}
      {...props}
    />
  )
}

export function DescriptionItemTitle({ className, ...props }: ComponentProps<'dt'>) {
  return (
    <dt
      data-slot="description-item-title"
      className={cn('min-w-0 text-xs font-medium text-text-secondary', className)}
      {...props}
    />
  )
}

type DescriptionItemDescriptionProps = Omit<ComponentProps<'dd'>, 'align'> & {
  align?: 'start' | 'end'
}

export function DescriptionItemDescription({
  align = 'end',
  className,
  ...props
}: DescriptionItemDescriptionProps) {
  return (
    <dd
      data-slot="description-item-description"
      className={cn(
        'min-w-0 text-sm font-semibold text-text-primary',
        align === 'start' ? 'text-start' : 'text-end',
        className,
      )}
      {...props}
    />
  )
}