import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/*
 * INPUT
 * ---------------------------------------------------------------------------
 * variant  outline (default)  white + border
 *          neutral            soft grey fill, turns white on focus
 *          bottom-border      underline only
 *          bare               no chrome; used inside <InputGroup>
 * size     xs | sm | md (default) | lg      (heights = --control-*)
 * Old size "default" still works (= md).
 */
const SIZE_MD = "h-control-md px-3 text-base"

const inputVariants = cva(
  "w-full min-w-0 text-text-primary transition-colors duration-(--duration-fast) outline-none placeholder:text-text-faint file:inline-flex file:border-0 file:bg-transparent file:font-semibold file:text-text-primary disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 autofill:transition-colors autofill:duration-[9999s] autofill:delay-[9999s]",
  {
    variants: {
      variant: {
        outline:
          "rounded-sm border border-border bg-surface hover:border-border-strong focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-focus/25 disabled:bg-surface-muted",
        neutral:
          "rounded-sm border border-transparent bg-surface-muted focus-visible:border-primary focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus/25",
        "bottom-border":
          "rounded-none border-0 border-b-2 border-b-border bg-transparent px-0 hover:border-b-border-strong focus-visible:border-b-primary",
        bare: "rounded-none border-0 bg-transparent focus-visible:ring-0 aria-invalid:ring-0",
      },
      size: {
        xs: "h-control-xs px-2 text-xs",
        sm: "h-control-sm px-2.5 text-sm",
        md: SIZE_MD,
        lg: "h-control-lg px-3.5 text-base",
        default: SIZE_MD, // deprecated alias of md
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "md",
    },
  }
)

type InputProps = Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants>

function Input({ className, variant, size, type, ...props }: InputProps) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, size }), className)}
      {...props}
    />
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Input, inputVariants }