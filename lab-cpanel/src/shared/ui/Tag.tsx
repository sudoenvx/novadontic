import { cn } from 'cn'
import type { HTMLAttributes } from 'react'

export type TagTone = 'neutral' | 'blue' | 'violet' | 'teal' | 'amber' | 'rose'

type TagProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: TagTone
}

const toneClasses: Record<TagTone, string> = {
  neutral: 'bg-surface-muted text-secondary',
  blue: 'bg-primary-soft text-primary-soft-foreground',
  violet: 'bg-accent-soft text-accent-soft-foreground',
  teal: 'bg-primary-soft text-primary-soft-foreground',
  amber: 'bg-accent-soft text-accent-soft-foreground',
  rose: 'bg-destructive-soft text-destructive',
}

export function Tag({ className, tone = 'neutral', ...props }: TagProps) {
  return <span className={cn('inline-flex w-fit items-center rounded-sm px-2.5 py-1 text-sm font-bold leading-tight', toneClasses[tone], className)} {...props} />
}
