import { cn } from 'cn'
import type { ReactNode } from 'react'

type PageHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn('mb-3 flex items-end justify-between gap-4 max-sm:flex-col max-sm:items-start', className)}>
      <div>
        {eyebrow && <p className="mb-1 text-sm font-bold text-brand-blue">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold leading-tight text-brand-ink">{title}</h1>
        {description && <p className="mt-1 text-md text-muted">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}
