import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const inputVariants = cva(
  "w-full min-w-0 rounded-sm transition-colors outline-none file:inline-flex file:border-0 file:bg-transparent file:font-semibold file:text-ink placeholder:text-text-muted border border-border focus-visible:bg-neutral-50  focus-visible:border-neutral-500 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted aria-invalid:ring-2 aria-invalid:ring-destructive/20 autofill:transition-colors autofill:duration-[9999s] autofill:delay-[9999s]",
  {
    variants: {
      size: {
        default: "h-8 px-2 py-0.5 text-sm md:text-xs/relaxed",
        xs: "h-6.5 px-1.5 py-0.5 text-xs",
        sm: "h-7 px-2 py-0.5 text-sm md:text-xs/relaxed",
        md: "h-9 px-3 py-1.5 text-sm",
        lg: "h-11 px-4 py-2 text-base",
      },

      variant: {

      }
    },
    defaultVariants: {
      size: "sm",
    },
  },
)

type InputProps = Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants>

function Input({ className, type, size, ...props }: InputProps) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        inputVariants({ size }),
        className
      )}
      {...props}
    />
  )
}

export { Input }
