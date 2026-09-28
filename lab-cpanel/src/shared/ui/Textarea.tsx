import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "field-sizing-content min-h-20 w-full resize-y rounded-sm border border-border bg-surface px-3 py-2.5 text-sm text-text-primary transition-colors duration-(--duration-fast) outline-none placeholder:text-text-faint hover:border-border-strong focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-focus/25 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
