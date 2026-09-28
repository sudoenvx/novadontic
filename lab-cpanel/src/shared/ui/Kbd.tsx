import { cn } from "cn"

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-control-xs min-w-control-xs w-fit items-center justify-center gap-1 rounded-xs border border-border bg-surface px-1 font-mono text-xs font-semibold text-text-primary shadow-card select-none in-data-[slot=tooltip-content]:border-surface/20 in-data-[slot=tooltip-content]:bg-text-primary/15 in-data-[slot=tooltip-content]:text-surface [&_svg:not([class*='size-'])]:size-3",
        className
      )}
      {...props}
    />
  )
}

function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  )
}

export { Kbd, KbdGroup }
