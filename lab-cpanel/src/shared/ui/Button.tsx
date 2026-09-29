import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/*
 * BUTTON
 * ---------------------------------------------------------------------------
 * variant  default      gradient primary action: ONE per screen
 *          solid        flat primary blue, when you need more than one
 *          secondary    dark ink pill/button
 *          outline      white + border: the everyday button ("Send back")
 *          neutral      soft grey fill
 *          soft         pale blue fill
 *          accent       violet
 *          ghost        no background, for toolbars and icon buttons
 *          danger       pale red, turns solid on hover ("Remove rush")
 *          destructive  solid red: confirm dialogs only
 *          link         text link
 * size     xs | sm | md (default) | lg | icon-xs | icon-sm | icon | icon-lg
 *
 * Heights come from --control-* in tokens.css. Sentence case only.
 * Old names still work: transparent, neutral-muted, neutral-outline,
 * size "default", size "md", size "icon-md": they map to the classes below.
 */

// Shared strings so the aliases can never drift from the real variants.
const OUTLINE =
  "border-border bg-surface text-text-primary hover:bg-surface-muted aria-expanded:bg-surface-muted"
const NEUTRAL =
  "bg-surface-muted  text-text-primary hover:bg-border aria-expanded:bg-border"
const GHOST =
  "text-text-secondary hover:bg-surface-muted hover:text-text-primary aria-expanded:bg-surface-muted"

const SIZE_MD =
  "h-control-md px-3.5 text-sm has-data-[icon=inline-start]:ps-2.5 has-data-[icon=inline-end]:pe-2.5"
const SIZE_ICON = "size-control-md p-0"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-sm border border-transparent text-sm font-bold whitespace-nowrap transition-colors duration-(--duration-fast) select-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-(--icon-size)",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover aria-expanded:bg-primary-hover",
        solid: "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
        outline: OUTLINE,
        neutral: NEUTRAL,
        soft: "bg-primary-soft text-primary-soft-foreground hover:bg-primary-soft-light",
        accent: "bg-accent text-accent-foreground hover:bg-accent-hover",
        ghost: GHOST,
        danger:
          "bg-destructive-soft text-destructive-soft-foreground hover:bg-destructive hover:text-destructive-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive-hover",
        link: "text-primary underline-offset-4 hover:underline",

        // Deprecated aliases, kept so existing call sites compile.
        transparent: GHOST,
        "neutral-muted": NEUTRAL,
        "neutral-outline": OUTLINE,
      },
      size: {
        xs: "h-control-xs rounded-xs px-2 text-xs gap-1 has-data-[icon=inline-start]:ps-1.5 has-data-[icon=inline-end]:pe-1.5 [&_svg:not([class*='size-'])]:size-(--icon-size-sm)",
        sm: "h-control-sm px-2.5 text-xs has-data-[icon=inline-start]:ps-2 has-data-[icon=inline-end]:pe-2 [&_svg:not([class*='size-'])]:size-(--icon-size-sm)",
        md: SIZE_MD,
        lg: "h-control-lg px-4.5 text-base has-data-[icon=inline-start]:ps-3.5 has-data-[icon=inline-end]:pe-3.5",

        "icon-xs":
          "size-control-xs rounded-xs p-0 [&_svg:not([class*='size-'])]:size-(--icon-size-sm)",
        "icon-sm":
          "size-control-sm p-0 [&_svg:not([class*='size-'])]:size-(--icon-size-sm)",
        icon: SIZE_ICON,
        "icon-lg": "size-control-lg p-0",

        // Deprecated aliases
        default: SIZE_MD,
        "icon-md": SIZE_ICON,
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

function Button({
  className,
  variant,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }