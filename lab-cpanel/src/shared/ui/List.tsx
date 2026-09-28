import type { ComponentProps, ComponentPropsWithoutRef } from 'react'
import { cn } from 'cn'

export type ListProps =
  | (ComponentPropsWithoutRef<'ul'> & { as?: 'ul' })
  | (ComponentPropsWithoutRef<'ol'> & { as: 'ol' })
  | (ComponentPropsWithoutRef<'dl'> & { as: 'dl' })

export function List({ as = 'ul', className, ...listProps }: ListProps) {
  const classNames = cn('m-0 grid min-w-0 list-none gap-2 p-0', className)

  if (as === 'dl') {
    return (
      <dl
        data-slot="list"
        className={classNames}
        {...(listProps as ComponentPropsWithoutRef<'dl'>)}
      />
    )
  }

  if (as === 'ol') {
    return (
      <ol
        data-slot="list"
        className={classNames}
        {...(listProps as ComponentPropsWithoutRef<'ol'>)}
      />
    )
  }

  return (
    <ul
      data-slot="list"
      className={classNames}
      {...(listProps as ComponentPropsWithoutRef<'ul'>)}
    />
  )
}

export type ListItemProps =
  | (ComponentPropsWithoutRef<'li'> & { as?: 'li' })
  | (ComponentPropsWithoutRef<'div'> & { as: 'div' })

export function ListItem({ as = 'li', className, ...itemProps }: ListItemProps) {
  const classNames = cn('flex min-w-0 items-start justify-between gap-3', className)

  if (as === 'div') {
    return (
      <div
        data-slot="list-item"
        className={classNames}
        {...(itemProps as ComponentPropsWithoutRef<'div'>)}
      />
    )
  }

  return (
    <li
      data-slot="list-item"
      className={classNames}
      {...(itemProps as ComponentPropsWithoutRef<'li'>)}
    />
  )
}

export function ListItemTitle({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      data-slot="list-item-title"
      className={cn('min-w-0 text-sm font-semibold text-text-primary', className)}
      {...props}
    />
  )
}

export function ListItemContent({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      data-slot="list-item-content"
      className={cn('min-w-0 text-sm text-text-secondary', className)}
      {...props}
    />
  )
}


