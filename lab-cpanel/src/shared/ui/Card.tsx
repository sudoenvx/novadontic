import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/*
 * CARD
 * ---------------------------------------------------------------------------
 *   <Card>
 *     <CardHeader>
 *       <CardTitle>Doctor &amp; clinic</CardTitle>
 *       <CardDescription>Optional line</CardDescription>
 *       <CardAction><Button size="sm" variant="outline">Edit</Button></CardAction>
 *     </CardHeader>
 *     <CardContent>…</CardContent>
 *     <CardFooter>…</CardFooter>
 *   </Card>
 *
 * variant  default      white, 1px border (the standard card)
 *          transparent  no fill, no border (layout wrapper)
 *          window       white frame with a tinted inner content pane
 * size     xs | sm | default | md     → inner padding + gap (--card-spacing)
 * Titles are ink, sentence case. Never link-blue, never uppercase.
 */
const cardVariants = cva(
  "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-lg border p-(--card-spacing) text-base text-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-70",
  {
    variants: {
      variant: {
        default: "border-border bg-surface shadow-card",
        transparent: "border-transparent bg-transparent",
        window: "border-border bg-surface shadow-card",
      },
      size: {
        xs: "[--card-spacing:--spacing(2)]",
        sm: "[--card-spacing:--spacing(3)]",
        default: "[--card-spacing:var(--card-padding)]",
        md: "[--card-spacing:--spacing(5)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Card({
  className,
  size,
  variant,
  disabled = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof cardVariants> & { disabled?: boolean }) {
  return (
    <div
      data-slot="card"
      data-size={size ?? "default"}
      data-variant={variant ?? "default"}
      data-disabled={disabled || undefined}
      className={cn(cardVariants({ size, variant }), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-0.5 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "text-md font-extrabold tracking-tight text-text-primary group-data-[size=xs]/card:text-base",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        "text-sm text-text-secondary group-data-[size=xs]/card:text-xs",
        className
      )}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        // window variant: content sits on a tinted pane inside the frame
        "group-data-[variant=window]/card:rounded-md group-data-[variant=window]/card:bg-surface-muted/50 group-data-[variant=window]/card:p-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
}

export {
  Card,
  // eslint-disable-next-line react-refresh/only-export-components
  cardVariants,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}