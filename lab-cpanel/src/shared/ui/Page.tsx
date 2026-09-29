import { cn } from 'cn'
import type { HTMLAttributes } from 'react'

type PageProps = HTMLAttributes<HTMLElement> & {
  size?: 'md' | 'lg' | 'full'
}

const sizeClasses = {
  md: 'max-w-[1080px]',
  lg: 'max-w-[1440px]',
  full: 'max-w-none',
}

export function Page({ className, size = 'lg', ...props }: PageProps) {
  return <main className={cn('flex w-full min-w-0 flex-col gap-3', sizeClasses[size], className)} {...props} />
}
