import type { CSSProperties, ComponentProps } from 'react'
import { cn } from 'cn'

function AspectRatio({
  ratio,
  className,
  style,
  ...props
}: ComponentProps<'div'> & { ratio: number }) {
  return (
    <div
      data-slot="aspect-ratio"
      style={{ ...style, '--ratio': ratio } as CSSProperties}
      className={cn("relative aspect-(--ratio)", className)}
      {...props}
    />
  )
}

export { AspectRatio }
