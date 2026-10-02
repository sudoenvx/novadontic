import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { cn } from "cn"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

/*
 * SELECT
 * ---------------------------------------------------------------------------
 *   <Select value={v} onValueChange={setV}>
 *     <SelectTrigger size="md"><SelectValue placeholder="Choose…" /></SelectTrigger>
 *     <SelectContent>
 *       <SelectItem value="a">Option A</SelectItem>
 *     </SelectContent>
 *   </Select>
 *
 * variant  outline (default) | neutral        size  xs | sm | md (default) | lg
 * Same heights and states as Input, so a Select and an Input line up in a row.
 * Old variant "default" and size "default" still work (= outline / md).
 */
const Select = SelectPrimitive.Root

const OUTLINE =
  "border-field-border text-text-primary hover:border-field-hover"
const SIZE_MD = "h-control-md text-sm"

const selectTriggerVariants = cva(
  "flex w-fit items-center justify-between gap-1.5 rounded-sm border px-2.5 font-medium whitespace-nowrap transition-colors duration-(--duration-fast) outline-none focus-visible:border-border-focus focus-visible:ring-3 focus-visible:ring-ring data-popup-open:border-border-focus data-popup-open:ring-3 data-popup-open:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-text-faint *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-(--icon-size-sm)",
  {
    variants: {
      variant: {
        outline: OUTLINE,
        neutral:
          "border-field-border bg-surface-muted text-text-primary hover:border-field-hover hover:bg-border",
        default: OUTLINE, // deprecated alias of outline
      },
      size: {
        xs: "h-control-xs px-2 text-xs",
        sm: "h-control-sm text-xs",
        md: SIZE_MD,
        lg: "h-control-lg text-base",
        default: SIZE_MD, // deprecated alias of md
      },
    },
    defaultVariants: { variant: "outline", size: "sm" },
  }
)

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1", className)}
      {...props}
    />
  )
}

function SelectValue({
  className,
  children,
  ...props
}: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("flex flex-1 text-start", className)}
      {...props}
    >
      {children}
    </SelectPrimitive.Value>
  )
}

function SelectTrigger({
  className,
  size,
  variant,
  children,
  ...props
}: SelectPrimitive.Trigger.Props & VariantProps<typeof selectTriggerVariants>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size ?? "md"}
      className={cn(selectTriggerVariants({ variant, size }), className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="pointer-events-none size-(--icon-size-sm) text-text-secondary" />
        }
      />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = false,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-(--z-dropdown)"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            "relative max-h-(--available-height) w-(--anchor-width) min-w-40 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md border border-border bg-surface p-1 text-text-primary shadow-popover duration-(--duration-fast) data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("px-2 py-1.5 text-xs font-medium text-text-secondary", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex min-h-control-sm w-full cursor-default items-center gap-2 rounded-sm ps-2 pe-7 text-sm outline-hidden select-none data-selected:bg-primary-soft data-selected:text-primary-soft-foreground data-highlighted:bg-surface-muted data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-(--icon-size-sm)",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute end-2 flex items-center justify-center" />
        }
      >
        <CheckIcon className="pointer-events-none" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border-soft", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "top-0 z-10 flex w-full cursor-default items-center justify-center bg-surface py-1 text-text-secondary [&_svg:not([class*='size-'])]:size-(--icon-size-sm)",
        className
      )}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-surface py-1 text-text-secondary [&_svg:not([class*='size-'])]:size-(--icon-size-sm)",
        className
      )}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}