import { cn } from 'cn'
import type { CSSProperties, HTMLAttributes } from 'react'

export type TagColor =
  | 'neutral'
  | 'blue'
  | 'violet'
  | 'teal'
  | 'amber'
  | 'rose'
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'destructive'
export type TagTone = TagColor | 'outline'
export type TagVariant = 'soft' | 'solid' | 'outline' | 'dot'
export type TagSize = 'sm' | 'md' | 'lg'

type TagProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: TagTone
  variant?: TagVariant
  color?: TagColor | (string & {})
  foregroundColor?: string
  size?: TagSize
}

const colorVariants: Record<TagColor, Record<Exclude<TagVariant, 'dot'>, string>> = {
  neutral: {
    soft: 'bg-neutral-100 text-text-secondary',
    solid: 'bg-neutral-600 text-white',
    outline: 'border border-border-strong bg-transparent text-text-secondary',
  },
  blue: {
    soft: 'bg-info-soft text-info-soft-foreground',
    solid: 'bg-info text-info-foreground',
    outline: 'border border-info text-info',
  },
  violet: {
    soft: 'bg-accent-soft text-accent-soft-foreground',
    solid: 'bg-accent text-accent-foreground',
    outline: 'border border-accent text-accent',
  },
  teal: {
    soft: 'bg-success-soft text-success-soft-foreground',
    solid: 'bg-success text-success-foreground',
    outline: 'border border-success text-success',
  },
  amber: {
    soft: 'bg-warning-soft text-warning-soft-foreground',
    solid: 'bg-warning text-warning-foreground',
    outline: 'border border-warning text-warning',
  },
  rose: {
    soft: 'bg-destructive-soft text-destructive-soft-foreground',
    solid: 'bg-destructive text-destructive-foreground',
    outline: 'border border-destructive text-destructive',
  },
  primary: {
    soft: 'bg-primary-soft text-primary-soft-foreground',
    solid: 'bg-primary text-primary-foreground',
    outline: 'border border-primary text-primary',
  },
  accent: {
    soft: 'bg-accent-soft text-accent-soft-foreground',
    solid: 'bg-accent text-accent-foreground',
    outline: 'border border-accent text-accent',
  },
  success: {
    soft: 'bg-success-soft text-success-soft-foreground',
    solid: 'bg-success text-success-foreground',
    outline: 'border border-success text-success',
  },
  warning: {
    soft: 'bg-warning-soft text-warning-soft-foreground',
    solid: 'bg-warning text-warning-foreground',
    outline: 'border border-warning text-warning',
  },
  destructive: {
    soft: 'bg-destructive-soft text-destructive-soft-foreground',
    solid: 'bg-destructive text-destructive-foreground',
    outline: 'border border-destructive text-destructive',
  },
}

const sizeClasses: Record<TagSize, string> = {
  sm: 'gap-1 rounded-sm px-2 py-0.5 text-2xs',
  md: 'gap-1.5 rounded-sm px-2.5 py-1 text-xs',
  lg: 'gap-1.5 rounded-md px-3 py-1.5 text-sm',
}

export function Tag({
  className,
  color,
  foregroundColor,
  size = 'sm',
  style,
  tone = 'neutral',
  variant,
  ...props
}: TagProps) {
  const selectedColor = color ?? (tone === 'outline' ? 'neutral' : tone)
  const selectedVariant = variant ?? (tone === 'outline' ? 'outline' : 'soft')
  const knownColor = isTagColor(selectedColor)
  const tokenColor: TagColor = knownColor ? selectedColor : 'neutral'
  const customColorStyle: CSSProperties | undefined = color || foregroundColor
    ? {
        ...(!knownColor && color ? { backgroundColor: color } : {}),
        ...(foregroundColor ? { color: foregroundColor } : {}),
      }
    : undefined
  const dotStyle: CSSProperties | undefined = selectedVariant === 'dot' && foregroundColor
    ? { '--tag-indicator-color': foregroundColor } as CSSProperties
    : undefined

  return (
    <span
      className={cn(
        'inline-flex w-fit max-w-full items-center font-medium leading-tight',
        sizeClasses[size],
        colorVariants[tokenColor][selectedVariant === 'dot' ? 'soft' : selectedVariant],
        selectedVariant === 'dot' && 'before:size-1.5 before:shrink-0 before:rounded-full before:bg-[var(--tag-indicator-color,currentColor)] before:content-[""]',
        className,
      )}
      style={{ ...style, ...customColorStyle, ...dotStyle }}
      {...props}
    />
  )
}

function isTagColor(color: string): color is TagColor {
  return Object.hasOwn(colorVariants, color)
}
