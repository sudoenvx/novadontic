import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from 'cn'

type AppHeaderProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
  title: ReactNode
  description?: ReactNode
}

type AppHeaderActionsProps = {
  children: ReactNode
  className?: string
}

export function AppHeader({ children, className, description, title, ...props }: AppHeaderProps) {
  return (
    <header className={cn('flex flex-wrap items-center justify-between gap-3 rounded-md bg-surface p-2 shadow-card', className)} {...props}>
      <div className="min-w-0">
        <h1 className="text-base font-semibold uppercase text-primary">{title}</h1>
        {description && <p className="text-sm text-text-muted">{description}</p>}
      </div>
      {children}
    </header>
  )
}

export function AppHeaderActions({ children, className }: AppHeaderActionsProps) {
  return <div className={cn('flex flex-wrap items-center gap-2', className)}>{children}</div>
}
