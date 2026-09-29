import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible'
import { cn } from 'cn'

function Collapsible({ ...props }: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({
  className,
  ...props
}: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      className={cn('text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-focus/30', className)}
      {...props}
    />
  )
}

function CollapsiblePanel({
  className,
  ...props
}: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-panel"
      className={cn(
        'overflow-hidden transition-[height] duration-(--duration-base) ease-standard data-ending-style:h-0 data-starting-style:h-0',
        className,
      )}
      {...props}
    />
  )
}

export { Collapsible, CollapsiblePanel, CollapsibleTrigger }