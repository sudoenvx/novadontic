import { Switch as SwitchPrimitive } from '@base-ui/react/switch'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'

const switchVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center rounded-full bg-surface-muted p-0.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/30 data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-checked:[&>span]:translate-x-full',
  {
    variants: {
      variant: {
        default: 'data-checked:bg-primary',
        accent: 'data-checked:bg-accent',
        destructive: 'data-checked:bg-destructive',
        neutral: 'data-checked:bg-secondary',
      },
      size: {
        sm: 'h-5 w-9 [&>span]:size-4',
        md: 'h-6 w-11 [&>span]:size-5',
        lg: 'h-7 w-13 [&>span]:size-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  },
)

type SwitchProps = SwitchPrimitive.Root.Props & VariantProps<typeof switchVariants>

export function Switch({ className, size, variant, children, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root className={cn(switchVariants({ size, variant }), className)} {...props}>
      {children ?? <SwitchPrimitive.Thumb className="block rounded-full bg-surface shadow-sm transition-transform" />}
    </SwitchPrimitive.Root>
  )
}
