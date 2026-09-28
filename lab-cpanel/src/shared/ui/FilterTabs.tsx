import { Toggle } from '@base-ui/react/toggle'
import { ToggleGroup } from '@base-ui/react/toggle-group'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from 'cn'

const filterTabVariants = cva(
  'inline-flex shrink-0 items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-xs font-semibold normal-case leading-tight text-text-secondary transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus/25 disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*=\'size-\'])]:size-3.5',
  {
    variants: {
      variant: {
        default:
          'bg-surface-muted-light hover:bg-surface-muted data-pressed:bg-primary-soft data-pressed:text-primary-soft-foreground',
        accent:
          'bg-accent-soft-light text-accent-soft-foreground hover:bg-accent-soft data-pressed:bg-accent data-pressed:text-accent-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type FilterTabsProps = Omit<
  ToggleGroup.Props<string>,
  'defaultValue' | 'multiple' | 'onValueChange' | 'value'
> & {
  defaultValue?: string
  onValueChange?: (value: string) => void
  value?: string
}

export function FilterTabs({
  className,
  defaultValue,
  onValueChange,
  value,
  ...props
}: FilterTabsProps) {
  return (
    <ToggleGroup
      {...props}
      data-slot="filter-tabs"
      value={value === undefined ? undefined : [value]}
      defaultValue={defaultValue === undefined ? undefined : [defaultValue]}
      multiple={false}
      onValueChange={(values) => {
        const nextValue = values[0]

        if (nextValue !== undefined) {
          onValueChange?.(nextValue)
        }
      }}
      className={cn('max-w-full', className)}
    />
  )
}

export function FilterTabsList({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="filter-tabs-list"
      className={cn('no-scrollbar flex max-w-full gap-1 overflow-x-auto', className)}
      {...props}
    />
  )
}

export type FilterTabProps = Toggle.Props<string> &
  VariantProps<typeof filterTabVariants> & {
    color?: string
    count?: number
  }

type FilterTabContentProps = {
  children?: ReactNode
  color?: string
  count?: number
}

function FilterTabContent({
  children,
  color,
  count,
}: FilterTabContentProps) {
  return (
    <>
      {color && (
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {children}
      {count !== undefined && <span className="font-mono text-2xs tabular">({count})</span>}
    </>
  )
}

export function FilterTab({
  children,
  className,
  color,
  count,
  variant,
  ...props
}: FilterTabProps) {
  return (
    <Toggle
      {...props}
      data-slot="filter-tab"
      className={cn(filterTabVariants({ variant }), className)}
    >
      <FilterTabContent color={color} count={count}>
        {children}
      </FilterTabContent>
    </Toggle>
  )
}

export type FilterTabActionProps = ComponentProps<'button'> &
  VariantProps<typeof filterTabVariants> &
  FilterTabContentProps

export function FilterTabAction({
  children,
  className,
  color,
  count,
  variant,
  type = 'button',
  ...props
}: FilterTabActionProps) {
  return (
    <button
      {...props}
      type={type}
      data-slot="filter-tab-action"
      className={cn(filterTabVariants({ variant }), className)}
    >
      <FilterTabContent color={color} count={count}>
        {children}
      </FilterTabContent>
    </button>
  )
}
