import type { ReactNode } from 'react'
import { cn } from 'cn'

export type StatisticCardProps = {
  label: string
  value: string
  detail?: string
  icon?: ReactNode
  featured?: boolean
  tone?: 'default' | 'destructive'
}

export function StatisticCard({
  label,
  value,
  detail,
  icon,
  featured = false,
  tone = 'default',
}: StatisticCardProps) {
  return (
    <article
      className={cn(
        'min-w-0 rounded-lg border border-border bg-surface p-2',
        featured && 'ring ring-accent bg-accent-soft-light',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 text-sm font-semibold text-text-secondary">{label}</p>
        {icon && (
          <span
            className={cn(
              'grid size-8 shrink-0 place-items-center rounded-md bg-primary-soft-light text-primary',
              featured && 'bg-accent-soft text-text',
              tone === 'destructive' && 'text-destructive',
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <p
        className={cn(
          'mt-2 wrap-break-word text-2xl font-extrabold leading-tight tracking-tight text-text-primary tabular',
          tone === 'destructive' && 'text-destructive',
        )}
      >
        {value}
      </p>
      {detail && (
        <p className="mt-1 text-xs text-text-secondary">{detail}</p>
      )}
    </article>
  )
}
