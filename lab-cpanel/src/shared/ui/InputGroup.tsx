import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import { Button } from "./Button"
import { Input } from "./Input"
import { Textarea } from "./Textarea"

/*
 * INPUT GROUP: one bordered box holding an input plus addons.
 *
 *   <InputGroup>
 *     <InputGroupAddon><SearchIcon /></InputGroupAddon>
 *     <InputGroupInput placeholder="Search" />
 *     <InputGroupAddon align="inline-end"><InputGroupButton>Go</InputGroupButton></InputGroupAddon>
 *   </InputGroup>
 *
 * variant  outline (default) | neutral        size  xs | sm | md (default) | lg
 * Set data-disabled="true" on <InputGroup> to grey the whole group out.
 */
const inputGroupVariants = cva(
  [
    "group/input-group relative flex w-full min-w-0 items-center overflow-hidden rounded-sm border text-text-primary transition-colors duration-(--duration-fast) outline-none",
    // the control fills the box; its own chrome is removed (Input variant="bare")
    "[&>input]:h-full [&>input]:flex-1",
    // focus + error live on the wrapper, not the inner control
    "focus-within:border-primary focus-within:ring-3 focus-within:ring-focus/25",
    "has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-3 has-[[data-slot][aria-invalid=true]]:ring-destructive/20",
    "data-[disabled=true]:pointer-events-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50",
    // addons above/below the input stack vertically and let the box grow
    "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>textarea]:h-auto",
    "has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=block-end]]:[&>input]:pt-3",
  ],
  {
    variants: {
      variant: {
        outline: "border-border bg-surface hover:border-border-strong",
        neutral:
          "border-transparent bg-surface-muted focus-within:bg-surface",
      },
      size: {
        xs: "h-control-xs text-xs [&>input]:px-1.5 [&>textarea]:px-1.5 [&>textarea]:py-1",
        sm: "h-control-sm text-sm [&>input]:px-2 [&>textarea]:px-2 [&>textarea]:py-1.5",
        md: "h-control-md text-base [&>input]:px-2.5 [&>textarea]:px-2.5 [&>textarea]:py-2",
        lg: "h-control-lg text-base [&>input]:px-3.5 [&>textarea]:px-3.5 [&>textarea]:py-2.5",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "md",
    },
  }
)

function InputGroup({
  size,
  variant,
  className,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupVariants>) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(inputGroupVariants({ size, variant }), className)}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-1 py-1.5 text-sm font-medium text-text-secondary select-none **:data-[slot=kbd]:rounded-xs **:data-[slot=kbd]:bg-transparent **:data-[slot=kbd]:px-1 **:data-[slot=kbd]:text-2xs [&>svg:not([class*='size-'])]:size-(--icon-size-sm)",
  {
    variants: {
      align: {
        "inline-start":
          "order-first ps-2 has-[>button]:-ms-1 has-[>kbd]:-ms-1",
        "inline-end": "order-last pe-2 has-[>button]:-me-1 has-[>kbd]:-me-1",
        "block-start": "order-first w-full justify-start px-2 pt-2 [.border-b]:pb-2",
        "block-end": "order-last w-full justify-start px-2 pb-2 [.border-t]:pt-2",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  }
)

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        // clicking the addon focuses the field, unless the click hit a button
        if ((e.target as HTMLElement).closest("button")) return
        e.currentTarget.parentElement
          ?.querySelector<HTMLElement>("input, textarea")
          ?.focus()
      }}
      {...props}
    />
  )
}

/** Buttons inside a group reuse <Button>; only these sizes fit the box. */
type InputGroupButtonSize = "xs" | "sm" | "icon-xs" | "icon-sm"

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size" | "type"> & {
  size?: InputGroupButtonSize
  type?: "button" | "submit" | "reset"
}) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      size={size}
      className={cn("shadow-none", className)}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 text-sm text-text-secondary [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-(--icon-size)",
        className
      )}
      {...props}
    />
  )
}

function InputGroupInput({
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "size">) {
  return (
    <Input
      data-slot="input-group-control"
      variant="bare"
      className={cn("flex-1", className)}
      {...props}
    />
  )
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0",
        className
      )}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}