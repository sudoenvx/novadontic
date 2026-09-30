import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type CSSProperties,
  type ComponentType,
  type RefAttributes,
  type ReactNode,
} from 'react'
import { GripVertical } from 'lucide-react'

import { Button } from './Button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './Tooltip'

export type ModelRendererHandle = {
  resetView: () => void
  takeSnapshot: () => void
}

export type ModelSource = {
  name: string
  url?: string
  file?: File
}

export type ModelRendererSettings = {
  autoRotate: boolean
  wireframe: boolean
  flatShading: boolean
  panMode: boolean
  backgroundColor: string
  modelColor?: string
}

export type ModelStatistics = {
  triangles: number
  vertices: number
  width: number
  depth: number
  height: number
}

export type ModelRendererProps = {
  source: ModelSource
  settings: ModelRendererSettings
  toolbar?: ReactNode
  onLoad: (statistics: ModelStatistics) => void
  onError: (message: string) => void
}

type EngineComponent = ComponentType<
  ModelRendererProps & RefAttributes<ModelRendererHandle>
>

type ToolbarPosition = {
  left: number
  top: number
}

type ToolbarDrag = {
  pointerId: number
  offsetX: number
  offsetY: number
}

const TOOLBAR_INSET = 12

function clampToolbarPosition(
  position: ToolbarPosition,
  container: HTMLElement,
  toolbar: HTMLElement,
): ToolbarPosition {
  return {
    left: Math.min(
      Math.max(position.left, TOOLBAR_INSET),
      Math.max(TOOLBAR_INSET, container.clientWidth - toolbar.offsetWidth - TOOLBAR_INSET),
    ),
    top: Math.min(
      Math.max(position.top, TOOLBAR_INSET),
      Math.max(TOOLBAR_INSET, container.clientHeight - toolbar.offsetHeight - TOOLBAR_INSET),
    ),
  }
}

export const ModelRenderer = forwardRef<ModelRendererHandle, ModelRendererProps>(
  function ModelRenderer(props, forwardedRef) {
    const [Engine, setEngine] = useState<EngineComponent>()
    const [toolbarPosition, setToolbarPosition] = useState<ToolbarPosition>()
    const containerRef = useRef<HTMLDivElement>(null)
    const toolbarRef = useRef<HTMLDivElement>(null)
    const dragRef = useRef<ToolbarDrag | undefined>(undefined)
    const onErrorRef = useRef(props.onError)
    const hasToolbar = Boolean(props.toolbar)

    useEffect(() => {
      onErrorRef.current = props.onError
    }, [props.onError])

    useEffect(() => {
      const container = containerRef.current
      const toolbar = toolbarRef.current
      if (!container || !toolbar) return

      const resizeObserver = new ResizeObserver(() => {
        setToolbarPosition((position) =>
          position
            ? clampToolbarPosition(position, container, toolbar)
            : position,
        )
      })
      resizeObserver.observe(container)
      resizeObserver.observe(toolbar)
      return () => resizeObserver.disconnect()
    }, [Engine, hasToolbar])

    useEffect(() => {
      let isMounted = true

      void import('./ThreeModelRenderer')
        .then(({ ThreeModelRenderer }) => {
          if (isMounted) setEngine(() => ThreeModelRenderer)
        })
        .catch((error: unknown) => {
          if (isMounted) {
            onErrorRef.current(
              error instanceof Error
                ? `The 3D rendering engine could not be loaded: ${error.message}`
                : 'The 3D rendering engine could not be loaded.',
            )
          }
        })

      return () => {
        isMounted = false
      }
    }, [])

    if (!Engine) {
      return <div className="absolute inset-0" />
    }

    function moveToolbarToPointer(event: ReactPointerEvent<HTMLButtonElement>) {
      const container = containerRef.current
      const toolbar = toolbarRef.current
      const drag = dragRef.current
      if (!container || !toolbar || !drag || drag.pointerId !== event.pointerId) return

      const bounds = container.getBoundingClientRect()
      setToolbarPosition(
        clampToolbarPosition(
          {
            left: event.clientX - bounds.left - drag.offsetX,
            top: event.clientY - bounds.top - drag.offsetY,
          },
          container,
          toolbar,
        ),
      )
    }

    function handleToolbarPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
      if (event.button !== 0) return
      const container = containerRef.current
      const toolbar = toolbarRef.current
      if (!container || !toolbar) return

      const containerBounds = container.getBoundingClientRect()
      const toolbarBounds = toolbar.getBoundingClientRect()
      const position = clampToolbarPosition(
        {
          left: toolbarBounds.left - containerBounds.left,
          top: toolbarBounds.top - containerBounds.top,
        },
        container,
        toolbar,
      )
      setToolbarPosition(position)
      dragRef.current = {
        pointerId: event.pointerId,
        offsetX: event.clientX - toolbarBounds.left,
        offsetY: event.clientY - toolbarBounds.top,
      }
      event.currentTarget.setPointerCapture(event.pointerId)
      event.preventDefault()
    }

    function handleToolbarPointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
      if (dragRef.current?.pointerId !== event.pointerId) return
      dragRef.current = undefined
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
    }

    function handleToolbarMoveKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
      if (event.key === 'Home') {
        event.preventDefault()
        setToolbarPosition(undefined)
        return
      }

      const directions: Record<string, ToolbarPosition> = {
        ArrowDown: { left: 0, top: 16 },
        ArrowLeft: { left: -16, top: 0 },
        ArrowRight: { left: 16, top: 0 },
        ArrowUp: { left: 0, top: -16 },
      }
      const direction = directions[event.key]
      if (!direction) return

      const container = containerRef.current
      const toolbar = toolbarRef.current
      if (!container || !toolbar) return

      event.preventDefault()
      const containerBounds = container.getBoundingClientRect()
      const toolbarBounds = toolbar.getBoundingClientRect()
      const currentPosition = toolbarPosition ?? {
        left: toolbarBounds.left - containerBounds.left,
        top: toolbarBounds.top - containerBounds.top,
      }
      setToolbarPosition(
        clampToolbarPosition(
          {
            left: currentPosition.left + direction.left,
            top: currentPosition.top + direction.top,
          },
          container,
          toolbar,
        ),
      )
    }

    const toolbarStyle: CSSProperties | undefined = toolbarPosition
      ? { left: toolbarPosition.left, top: toolbarPosition.top }
      : undefined

    return (
      <div ref={containerRef} className="absolute inset-0">
        <Engine {...props} ref={forwardedRef} />
        {props.toolbar && (
          <TooltipProvider>
            <div
              ref={toolbarRef}
              className={`model-viewer-toolbar pointer-events-auto absolute z-10 flex max-h-[calc(100%-1.5rem)] max-w-[calc(100%-1.5rem)] flex-wrap items-center justify-center gap-1 overflow-auto rounded-lg border p-1 shadow-sm backdrop-blur-sm ${toolbarPosition ? '' : 'right-3 bottom-3'}`}
              style={toolbarStyle}
              role="toolbar"
              aria-label="3D model tools"
              data-canvas-theme={props.settings.backgroundColor.endsWith('dark') ? 'dark' : 'light'}
            >
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Move toolbar"
                      aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight Home"
                      onPointerDown={handleToolbarPointerDown}
                      onPointerMove={moveToolbarToPointer}
                      onPointerUp={handleToolbarPointerUp}
                      onPointerCancel={handleToolbarPointerUp}
                      onLostPointerCapture={() => { dragRef.current = undefined }}
                      onKeyDown={handleToolbarMoveKeyDown}
                      className="cursor-grab touch-none active:cursor-grabbing"
                    />
                  }
                >
                  <GripVertical className="size-4" aria-hidden="true" />
                </TooltipTrigger>
                <TooltipContent>Drag to move; use arrow keys to position</TooltipContent>
              </Tooltip>
              {props.toolbar}
            </div>
          </TooltipProvider>
        )}
      </div>
    )
  },
)
