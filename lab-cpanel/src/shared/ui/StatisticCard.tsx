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
        'rounded-md bg-neutral-100 border border-border p-2',
        featured && 'outline outline-accent text-accent-foreground',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={cn('text-sm text-text-muted')}>
          {label}
        </p>
        {icon && (
          <span
            className={cn(
              'flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-text-muted',
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
          tone === 'destructive' && 'text-destructive',
        )}
      >
        {value}
      </p>
      {detail && (
        <p
          className={cn(
            'mt-1! text-sm text-text-muted',
          )}
        >
          {detail}
        </p>
      )}
    </article>
  )
}
