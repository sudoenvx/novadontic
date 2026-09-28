import { cn } from 'cn'
import type { HTMLAttributes } from 'react'

export type TagTone = 'neutral' | 'blue' | 'violet' | 'teal' | 'amber' | 'rose'

type TagProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: TagTone
}

const toneClasses: Record<TagTone, string> = {
  neutral: 'bg-surface-muted text-text-secondary',
  blue: 'bg-info-soft text-info-soft-foreground',
  violet: 'bg-accent-soft text-accent-soft-foreground',
  teal: 'bg-success-soft text-success-soft-foreground',
  amber: 'bg-warning-soft text-warning-soft-foreground',
  rose: 'bg-destructive-soft text-destructive-soft-foreground',
}

export function Tag({ className, tone = 'neutral', ...props }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex w-fit max-w-full items-center gap-1.5 rounded-xs px-2 py-1 text-xs font-semibold leading-tight',
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  )
}
