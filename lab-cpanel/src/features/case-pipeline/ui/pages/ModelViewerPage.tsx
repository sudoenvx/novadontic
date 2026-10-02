import {
  Camera,
  ClipboardList,
  Hand,
  Info,
  Moon,
  RotateCcw,
  ScanLine,
  Sun,
  Stethoscope,
  Triangle,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'

import { getApiErrorMessage } from '../../../../shared/api/apiError'
import { Button } from '../../../../shared/ui/Button'
import ColorPicker from '../../../../shared/ui/ColorPicker'
import {
  ModelRenderer,
  type ModelRendererHandle,
  type ModelRendererSettings,
  type ModelStatistics,
  type ModelSource,
} from '../../../../shared/ui/ModelRenderer'
import { downloadCaseFile } from '../../api/case-assets.api'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../../../shared/ui/Tooltip'
import { DEMO_STL_MODEL_URL } from '../../data/cases'

const modelViewerStyles = `
.model-viewer-toolbar,
.model-viewer-info,
.model-viewer-info-toggle {
  background-color: var(--surface);
  color: var(--text-primary);
  border-color: var(--border-subtle);
}

.model-viewer-toolbar[data-canvas-theme="dark"],
.model-viewer-info[data-canvas-theme="dark"],
.model-viewer-info-toggle[data-canvas-theme="dark"] {
  --surface: var(--brand-int);
  --surface-raised: var(--brand-int);
  --surface-muted: var(--neutral-600);
  --border: var(--neutral-600);
  --border-subtle: var(--neutral-600);
  --field-border: var(--neutral-600);
  --text-primary: var(--neutral-50);
  --text-secondary: var(--neutral-500);
  --primary-soft: var(--primary);
  --primary-soft-foreground: var(--primary-foreground);
}

.model-viewer-toolbar {
  box-shadow: var(--shadow-float-value);
}

.model-viewer-toolbar [data-slot="button"] {
  color: var(--text-secondary);
}

.model-viewer-toolbar [data-slot="button"]:hover,
.model-viewer-toolbar [data-slot="button"][aria-expanded="true"] {
  background-color: var(--surface-muted);
  color: var(--text-primary);
}

.model-viewer-toolbar [data-slot="button"][aria-pressed="true"] {
  background-color: var(--primary-soft);
  color: var(--primary-soft-foreground);
}

.model-viewer-toolbar [role="dialog"] > div {
  background-color: var(--surface-raised);
  border-color: var(--border);
  color: var(--text-primary);
  box-shadow: var(--shadow-popover-value);
}

.model-viewer-toolbar [role="dialog"] .text-text-primary {
  color: var(--text-primary);
}

.model-viewer-toolbar [role="dialog"] .text-text-secondary {
  color: var(--text-secondary);
}

.model-viewer-toolbar[data-canvas-theme="dark"] [role="dialog"] input {
  background-color: var(--surface-muted);
  border-color: var(--field-border);
  color: var(--text-primary);
  color-scheme: dark;
}

.model-viewer-info,
.model-viewer-info-toggle {
  box-shadow: var(--shadow-float-value);
}

.model-viewer-info .text-text-primary {
  color: var(--text-primary);
}

.model-viewer-info .text-text-secondary,
.model-viewer-info .text-text-muted {
  color: var(--text-secondary);
}

.model-viewer-info [data-slot="button"] {
  color: var(--text-secondary);
}

.model-viewer-info [data-slot="button"]:hover,
.model-viewer-info-toggle:hover {
  background-color: var(--surface-muted);
  color: var(--text-primary);
}

.model-viewer-info-toggle {
  color: var(--text-primary);
}
`

export function ModelViewerPage() {
  const [searchParams] = useSearchParams()
  const fileId = searchParams.get('fileId')
  const caseNumber = searchParams.get('caseNumber')
  return (
    <ModelViewerContent
      key={`${caseNumber ?? ''}:${fileId ?? 'demo'}`}
      modelName={searchParams.get('fileName') || 'Sample model.stl'}
      caseNumber={caseNumber}
      fileId={fileId}
      doctorName={searchParams.get('doctorName')}
    />
  )
}

type ModelViewerContentProps = {
  modelName: string
  caseNumber: string | null
  fileId: string | null
  doctorName: string | null
}

function ModelViewerContent({
  modelName,
  caseNumber,
  fileId,
  doctorName,
}: ModelViewerContentProps) {
  const rendererRef = useRef<ModelRendererHandle>(null)
  const [wireframe, setWireframe] = useState(false)
  const [flatShading, setFlatShading] = useState(false)
  const [panMode, setPanMode] = useState(false)
  const [canvasTheme, setCanvasTheme] = useState<'dark' | 'light'>(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
  )
  const [modelColor, setModelColor] = useState<string>()
  const [showModelInfo, setShowModelInfo] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string>()
  const [fileSourceUrl, setFileSourceUrl] = useState<string>()
  const [modelStats, setModelStats] = useState<ModelStatistics>()
  useEffect(() => {
    if (!fileId || !caseNumber) return

    let isActive = true
    let createdUrl: string | undefined

    void downloadCaseFile(caseNumber, fileId).then((blob) => {
      if (!isActive) return
      createdUrl = URL.createObjectURL(blob)
      setFileSourceUrl(createdUrl)
    }).catch((error: unknown) => {
      if (!isActive) return
      setIsLoading(false)
      setErrorMessage(getApiErrorMessage(error, 'The model file could not be loaded.'))
    })

    return () => {
      isActive = false
      if (createdUrl) URL.revokeObjectURL(createdUrl)
    }
  }, [caseNumber, fileId])
  const displayedErrorMessage = errorMessage ??
    (fileId && !caseNumber ? 'A case number is required to load this file.' : undefined)
  const shouldShowLoading = isLoading && !(fileId && !caseNumber)
  const source = useMemo<ModelSource>(() => ({
    name: modelName,
    url: fileSourceUrl ?? DEMO_STL_MODEL_URL,
  }), [fileSourceUrl, modelName])
  const settings = useMemo<ModelRendererSettings>(() => ({
    autoRotate: false,
    wireframe,
    flatShading,
    panMode,
    canvasTheme,
    backgroundColor: canvasTheme === 'dark' ? '--brand-int' : '--canvas',
    modelColor,
  }), [canvasTheme, flatShading, modelColor, panMode, wireframe])
  const defaultModelColor = getTokenColor('--neutral-400')

  const handleLoad = useCallback((statistics: ModelStatistics) => {
    setModelStats(statistics)
    setIsLoading(false)
    setErrorMessage(undefined)
  }, [])

  const handleError = useCallback((message: string) => {
    setModelStats(undefined)
    setIsLoading(false)
    setErrorMessage(message)
  }, [])

  const toolbar = (
    <>
      <ModelViewerTool
        label="Reset camera position"
        icon={<RotateCcw className="size-4" aria-hidden="true" />}
        onClick={() => rendererRef.current?.resetView()}
      />
      <ModelViewerTool
        label={wireframe ? 'Show solid surface' : 'Show wireframe'}
        icon={<ScanLine className="size-4" aria-hidden="true" />}
        pressed={wireframe}
        onClick={() => setWireframe((current) => !current)}
      />
      <ModelViewerTool
        label={panMode ? 'Use rotate mode' : 'Use pan mode'}
        icon={<Hand className="size-4" aria-hidden="true" />}
        pressed={panMode}
        onClick={() => setPanMode((current) => !current)}
      />
      <ModelViewerTool
        label={`Switch to ${canvasTheme === 'dark' ? 'light' : 'dark'} canvas`}
        icon={canvasTheme === 'dark'
          ? <Sun className="size-4" aria-hidden="true" />
          : <Moon className="size-4" aria-hidden="true" />}
        onClick={() => setCanvasTheme((current) => current === 'dark' ? 'light' : 'dark')}
      />
      <ColorPicker
        label="Change model color"
        value={modelColor ?? defaultModelColor}
        defaultValue={defaultModelColor}
        onChange={setModelColor}
        presets={[
          getTokenColor('--primary'),
          getTokenColor('--accent'),
          getTokenColor('--success'),
          getTokenColor('--warning'),
          getTokenColor('--destructive'),
        ]}
      />
      <ModelViewerTool
        label="Save snapshot"
        icon={<Camera className="size-4" aria-hidden="true" />}
        onClick={() => rendererRef.current?.takeSnapshot()}
      />
      <ModelViewerTool
        label={flatShading ? 'Use smooth shading' : 'Use flat shading'}
        icon={<Triangle className="size-4" aria-hidden="true" />}
        pressed={flatShading}
        onClick={() => setFlatShading((current) => !current)}
      />
    </>
  )

  return (
    <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-canvas">
      <style>{modelViewerStyles}</style>
      <header className="flex min-h-navbar shrink-0 flex-wrap items-center justify-between gap-x-5 gap-y-2 border-b border-border bg-surface px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-text-primary">
          <ClipboardList className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="text-text-secondary">Case</span>
          <span className="truncate">{caseNumber || 'Standalone model'}</span>
        </div>
        <div className="flex min-w-0 items-center gap-2 text-sm text-text-secondary">
          <Stethoscope className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <span>Doctor</span>
          <span className="truncate font-semibold text-text-primary">
            {doctorName || 'No case linked'}
          </span>
        </div>
      </header>

      <section className="relative min-h-0 flex-1 overflow-hidden" aria-label="3D model preview">
        {(!fileId || fileSourceUrl) && (
          <ModelRenderer
            ref={rendererRef}
            source={source}
            settings={settings}
            toolbar={toolbar}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
        {shouldShowLoading && !displayedErrorMessage && (
          <p
            className="absolute inset-0 z-20 grid place-items-center bg-canvas text-sm text-text-secondary"
            role="status"
          >
            Loading 3D model…
          </p>
        )}
        {displayedErrorMessage && (
          <p
            className="absolute inset-0 z-20 grid place-items-center bg-canvas px-6 text-center text-sm text-destructive"
            role="alert"
          >
            {displayedErrorMessage}
          </p>
        )}
        {!shouldShowLoading && !displayedErrorMessage && modelStats && (
          showModelInfo ? (
            <section
              className="model-viewer-info absolute bottom-3 left-3 z-10 w-[min(17rem,calc(100%-1.5rem))] rounded-lg border p-3 shadow-sm"
              aria-label="Model information"
              data-canvas-theme={canvasTheme}
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-text-secondary">Model information</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Hide model information"
                  onClick={() => setShowModelInfo(false)}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </Button>
              </div>
              <p className="truncate text-sm font-bold text-text-primary">{modelName}</p>
              <dl className="mt-2 grid gap-1 text-xs">
                <StatRow label="Triangles" value={modelStats.triangles.toLocaleString()} />
                <StatRow label="Vertices" value={modelStats.vertices.toLocaleString()} />
                <StatRow label="Width (X)" value={formatDimension(modelStats.width)} />
                <StatRow label="Depth (Y)" value={formatDimension(modelStats.depth)} />
                <StatRow label="Height (Z)" value={formatDimension(modelStats.height)} />
              </dl>
            </section>
          ) : (
            <button
              type="button"
              className="model-viewer-info-toggle absolute bottom-3 left-3 z-10 grid size-control-md place-items-center rounded-full border shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              aria-label="Show model information"
              onClick={() => setShowModelInfo(true)}
              data-canvas-theme={canvasTheme}
            >
              <Info className="size-4" aria-hidden="true" />
            </button>
          )
        )}
      </section>
    </main>
  )
}

type ModelViewerToolProps = {
  label: string
  icon: ReactNode
  onClick: () => void
  pressed?: boolean
}

function ModelViewerTool({ label, icon, onClick, pressed }: ModelViewerToolProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="model-viewer-toolbar-button"
            aria-label={label}
            aria-pressed={pressed}
            onClick={onClick}
          />
        }
      >
        {icon}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="font-semibold tabular text-text-primary">{value}</dd>
    </div>
  )
}

function formatDimension(value: number) {
  return `${value.toFixed(2)} units`
}

function getTokenColor(token: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim()
}
