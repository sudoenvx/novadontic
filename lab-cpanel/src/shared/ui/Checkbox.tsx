import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { Check, Minus } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'

const checkboxVariants = cva(
  'inline-grid size-4 shrink-0 cursor-pointer place-items-center rounded-xs border border-border bg-surface p-0 text-primary-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 data-checked:border-primary data-checked:bg-primary data-indeterminate:border-primary data-indeterminate:bg-primary data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'size-4 [&_svg]:size-3',
        md: 'size-5 [&_svg]:size-3.5',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  },
)

type CheckboxProps = CheckboxPrimitive.Root.Props & VariantProps<typeof checkboxVariants>

export function Checkbox({ className, size, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root className={cn('group/checkbox', checkboxVariants({ size }), className)} {...props}>
      <CheckboxPrimitive.Indicator className="grid size-full place-items-center">
        <Check className="size-3 stroke-[3] group-data-indeterminate/checkbox:hidden" aria-hidden="true" />
        <Minus className="hidden size-3 stroke-[3] group-data-indeterminate/checkbox:grid" aria-hidden="true" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
