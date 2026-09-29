/* eslint-disable react-refresh/only-export-components */
"use client"

import * as React from "react"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"
import { Button } from "./Button"

const toast = ToastPrimitive.createToastManager()

const toastVariants = cva(
  [
    "group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(var(--z-toast)-var(--toast-index))] w-full origin-bottom rounded-md border text-text-primary shadow-float will-change-transform outline-none select-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-focus/25",
    "[--gap:var(--page-gap)] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:var(--page-gap)] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
    "h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_var(--duration-base)_var(--motion-ease),opacity_var(--duration-base),height_var(--duration-fast)]",
    "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
    "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
    "data-limited:opacity-0 data-starting-style:opacity-0 data-starting-style:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)+20px))_scale(var(--scale))]",
    "data-ending-style:duration-(--duration-fast) [&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)] data-ending-style:opacity-0",
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
        default: "border-border bg-surface text-text-primary",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        success: "border-success-soft bg-success-soft text-success-soft-foreground",
        warning: "border-warning-soft bg-warning-soft text-warning-soft-foreground",
        error: "border-destructive-soft bg-destructive-soft text-destructive-soft-foreground",
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
  "bottom-right": "bottom-4 right-4 left-auto top-auto",
}

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />
}

function ToastViewport({
  className,
  placement = "bottom-center",
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
        "flex h-full items-center gap-3 overflow-hidden p-2 transition-opacity duration-(--duration-slow) ease-standard data-behind:opacity-0 data-expanded:opacity-100",
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
        "text-sm font-bold text-text-primary group-data-[variant=secondary]/toast:text-secondary-foreground",
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
        "text-sm text-text-secondary group-data-[variant=secondary]/toast:text-secondary-foreground/80",
        className,
      )}
      {...props}
    />
  )
}

function ToastAction({
  className,
  render = <Button variant="outline" size="sm" />,
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
        "relative shrink-0 text-text-secondary after:absolute after:-inset-2 after:content-[''] hover:text-text-primary group-data-[variant=secondary]/toast:text-secondary-foreground group-data-[variant=secondary]/toast:hover:text-secondary-foreground",
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

const toastIcons: Record<string, React.ReactNode> = {
  success: <CircleCheckIcon className="text-success" aria-hidden="true" />,
  info: <InfoIcon className="text-info" aria-hidden="true" />,
  warning: <TriangleAlertIcon className="text-warning" aria-hidden="true" />,
  error: <OctagonXIcon className="text-destructive" aria-hidden="true" />,
  loading: <Loader2Icon className="animate-spin text-primary" aria-hidden="true" />,
}

function ToastIcon({ type }: { type: string | undefined }) {
  const icon = type ? toastIcons[type] : undefined
  if (!icon) return null

  return (
    <span
      data-slot="toast-icon"
      className="shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"
    >
      {icon}
    </span>
  )
}

function ToastList({ variant }: { variant: ToastVariant }) {
  const { toasts } = ToastPrimitive.useToastManager()

  return toasts.map((toastItem) => (
    <Toast key={toastItem.id} toast={toastItem} variant={variant}>
      <ToastContent>
        <ToastIcon type={toastItem.type} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastTitle />
          <ToastDescription />
        </div>
        <ToastAction />
        <ToastClose />
      </ToastContent>
    </Toast>
  ))
}

function Toaster({
  children,
  toastManager = toast,
  placement = "bottom-center",
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
