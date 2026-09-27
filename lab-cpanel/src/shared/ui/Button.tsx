import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-xs/relaxed font-medium! uppercase whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        transparent: "bg-transparent",
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        outline: "bg-surface text-neutral-600 hover:text-neutral-700 border! border-neutral-600! hover:bg-neutral-50 aria-expanded:bg-neutral-100",
        secondary: "bg-surface-muted text-ink hover:bg-neutral-300 aria-expanded:bg-neutral-200",
        accent: "bg-accent text-accent-foreground hover:bg-accent-hover aria-expanded:bg-accent-hover",
        ghost: "text-secondary hover:bg-surface-muted hover:text-text aria-expanded:bg-surface-muted",
        destructive: "bg-destructive-soft text-destructive hover:bg-destructive-hover hover:text-destructive-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        neutral: "bg-neutral-100 text-ink hover:bg-neutral-200 aria-expanded:bg-neutral-200",

        "neutral-muted": "bg-neutral-200 text-ink hover:bg-neutral-300 aria-expanded:bg-neutral-200",
        "neutral-outline": "bg-surface text-ink ring-1 ring-inset ring-neutral-300 hover:bg-neutral-100 aria-expanded:bg-neutral-100"
      },
      size: {
        // py-1.5 (6px) | px-3 (12px)
        default: "py-1.5 px-3 text-xs gap-1 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        
        // py-0.5 (2px) | px-1 (4px)
        xs: "py-0.5 px-1 rounded-sm text-[0.625rem]/none gap-1 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 [&_svg:not([class*='size-'])]:size-2.5",
        
        // py-1 (4px) | px-2 (8px)
        sm: "h-7 px-2 rounded-sm text-[11px]/none gap-1 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        
        // py-2 (8px) | px-4 (16px)
        lg: "py-3 px-4 text-sm/none gap-1 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-4",
        
        // Icon variants retain square dimensions using aspect-square or matching padding
        icon: "p-1.5 aspect-square [&_svg:not([class*='size-'])]:size-3.5",
        "icon-xs": "p-0.5 rounded-sm aspect-square [&_svg:not([class*='size-'])]:size-2.5",
        "icon-sm": "p-1 rounded-xs aspect-square [&_svg:not([class*='size-'])]:size-3",
        "icon-md": "p-1.5 rounded-xs aspect-square [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "p-2 rounded-xs aspect-square [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "sm",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
