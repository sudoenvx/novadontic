/* eslint-disable react-refresh/only-export-components */
"use client"

import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { XIcon } from "lucide-react"
import { Button } from "./Button"

const toast = ToastPrimitive.createToastManager()

const toastVariants = cva(
  [
    "group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(var(--z-toast)-var(--toast-index))] w-fit max-w-full origin-bottom rounded-[4px] border-0 bg-brand-ink text-white shadow-sm will-change-transform outline-none select-none focus-visible:ring-2 focus-visible:ring-focus/25",
    "[--gap:var(--page-gap)] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:var(--page-gap)] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
    "h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:opacity_250ms_ease,transform_250ms_ease,height_250ms_ease]",
    "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
    "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
    "data-limited:opacity-0 data-starting-style:opacity-0 data-starting-style:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)+8px))_scale(var(--scale))]",
    "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(8px)] data-ending-style:opacity-0",
    "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
    "data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
    "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
    "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
    "data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
    "data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
    "data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
    "data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
    "group-data-[placement=top-left]/toast-viewport:left-0 group-data-[placement=top-left]/toast-viewport:right-auto group-data-[placement=bottom-left]/toast-viewport:left-0 group-data-[placement=bottom-left]/toast-viewport:right-auto",
  ],
  {
    variants: {
      variant: {
        default: "bg-brand-ink text-white",
        secondary: "bg-brand-ink text-white",
        success: "bg-brand-ink text-white",
        warning: "bg-brand-ink text-white",
        error: "bg-brand-ink text-white",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  },
)

type ToastVariant = NonNullable<VariantProps<typeof toastVariants>["variant"]>
type ToastPlacement =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"

const toastViewportPlacements: Record<ToastPlacement, string> = {
  "top-left": "top-4 left-4 right-auto bottom-auto",
  "top-center": "top-4 left-1/2 right-auto bottom-auto -translate-x-1/2",
  "top-right": "top-4 right-4 left-auto bottom-auto",
  "bottom-left": "bottom-4 left-4 right-auto top-auto",
  "bottom-center": "bottom-4 left-1/2 right-auto top-auto -translate-x-1/2",
  "bottom-right": "bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-4 left-auto top-auto",
}

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />
}

function ToastViewport({
  className,
  placement = "bottom-right",
  ...props
}: ToastPrimitive.Viewport.Props & { placement?: ToastPlacement }) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      data-placement={placement}
      className={cn(
        "group/toast-viewport pointer-events-none fixed z-(--z-toast) mx-auto w-[calc(100%-2rem)] max-w-sm outline-none",
        toastViewportPlacements[placement],
        className
      )}
      {...props}
    />
  )
}

function Toast({
  className,
  variant = "secondary",
  ...props
}: ToastPrimitive.Root.Props & VariantProps<typeof toastVariants>) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      data-variant={variant}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        "flex h-full items-center gap-3 overflow-hidden px-3.5 py-2 text-[.8125rem] transition-opacity duration-250 ease-[ease] data-behind:opacity-0 data-expanded:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn(
        "min-w-0 truncate text-[.8125rem] font-medium text-white",
        className,
      )}
      {...props}
    />
  )
}

function ToastDescription({
  className,
  ...props
}: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn(
        "min-w-0 truncate text-[.8125rem] text-white",
        className,
      )}
      {...props}
    />
  )
}

function ToastAction({
  className,
  render = (
    <button
      type="button"
      className="shrink-0 border-0 bg-transparent p-0 text-[.8125rem] font-semibold text-primary-light hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    />
  ),
  ...props
}: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      className={cn("shrink-0", className)}
      {...props}
    />
  )
}

function ToastClose({
  className,
  children,
  render = <Button variant="ghost" size="icon-sm" />,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close toast"
      render={render}
      className={cn(
        "relative shrink-0 text-white/70 after:absolute after:-inset-2 after:content-[''] hover:text-white",
        className
      )}
      {...props}
    >
      {children ?? (
        <XIcon aria-hidden="true" />
      )}
    </ToastPrimitive.Close>
  )
}

function ToastList({ variant }: { variant: ToastVariant }) {
  const { toasts } = ToastPrimitive.useToastManager()

  return toasts.map((toastItem) => (
    <Toast key={toastItem.id} toast={toastItem} variant={variant}>
      <ToastContent>
        <div className="flex min-w-0 flex-1 items-center gap-1">
          <ToastTitle />
          <ToastDescription />
        </div>
        <ToastAction />
      </ToastContent>
    </Toast>
  ))
}

function Toaster({
  children,
  toastManager = toast,
  placement = "bottom-right",
  variant = "secondary",
  ...props
}: ToastPrimitive.Provider.Props & {
  placement?: ToastPlacement
  variant?: ToastVariant
}) {
  return (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}
      <ToastPortal>
        <ToastViewport placement={placement}>
          <ToastList variant={variant} />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  )
}

const createToastManager = ToastPrimitive.createToastManager
const useToastManager = ToastPrimitive.useToastManager

export {
  Toaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  type ToastPlacement,
  type ToastVariant,
  toast,
  useToastManager,
}
