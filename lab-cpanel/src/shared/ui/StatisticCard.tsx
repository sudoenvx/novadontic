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
        'rounded-sm bg-surface p-2',
        featured && 'bg-accent text-accent-foreground',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={cn('text-sm text-text-muted', featured && 'text-accent-foreground/90')}>
          {label}
        </p>
        {icon && (
          <span
            className={cn(
              'flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-text-muted',
              featured && 'text-accent-foreground',
              tone === 'destructive' && 'text-destructive',
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <p
        className={cn(
          'mt-1 text-2xl font-semibold leading-tight text-text',
          featured && 'text-accent-foreground',
          tone === 'destructive' && 'text-destructive',
        )}
      >
        {value}
      </p>
      {detail && (
        <p
          className={cn(
            'mt-1! text-sm text-text-muted',
            featured && 'text-accent-foreground/90',
          )}
        >
          {detail}
        </p>
      )}
    </article>
  )
}
