import { cn } from 'cn'
import type { CSSProperties, HTMLAttributes } from 'react'

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'destructive' | 'accent'
export type BadgeSize = 'sm' | 'md'

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  color?: string
  foregroundColor?: string
  size?: BadgeSize
  tone?: BadgeTone
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-surface-muted text-secondary',
  info: 'bg-info-soft text-info-soft-foreground',
  success: 'bg-success-soft text-success-soft-foreground',
  warning: 'bg-warning-soft text-warning-soft-foreground',
  destructive: 'bg-destructive-soft text-destructive',
  accent: 'bg-accent-soft text-accent',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-2xs',
  md: 'px-2.5 py-1 text-sm',
}

export function Badge({
  className,
  color,
  foregroundColor,
  size = 'sm',
  style,
  tone = 'neutral',
  ...props
}: BadgeProps) {
  const customColorStyle: CSSProperties | undefined = color
    ? {
        backgroundColor: color,
        color: foregroundColor,
      }
    : undefined

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-xs font-medium uppercase',
        sizeClasses[size],
        toneClasses[tone],
        className,
      )}
      style={{ ...style, ...customColorStyle }}
      {...props}
    />
  )
}
