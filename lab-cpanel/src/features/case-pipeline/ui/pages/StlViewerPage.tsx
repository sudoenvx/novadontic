import {
  Box,
  Camera,
  Circle,
  Grid3X3,
  RotateCcw,
  RotateCw,
  Sun,
  Upload,
} from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Brand } from '../../../../shared/ui/Brand'
import { Button } from '../../../../shared/ui/Button'
import {
  StlViewer,
  type StlCanvasTheme,
  type StlModelColor,
  type StlViewerHandle,
} from '../../../../shared/ui/StlViewer'
import { DEMO_STL_MODEL_URL } from '../../data/cases'

const modelColors: { name: string; value: StlModelColor }[] = [
  { name: 'Default', value: 'default' },
  { name: 'Blue', value: 'primary' },
  { name: 'Violet', value: 'accent' },
  { name: 'Teal', value: 'success' },
  { name: 'Amber', value: 'warning' },
  { name: 'Rose', value: 'destructive' },
]

export function StlViewerPage() {
  const [searchParams] = useSearchParams()
  const initialFileName = searchParams.get('fileName') || 'Sample tooth.stl'
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const viewerRef = useRef<StlViewerHandle>(null)
  const [uploadedFile, setUploadedFile] = useState<File>()
  const [wireframe, setWireframe] = useState(false)
  const [flatShading, setFlatShading] = useState(false)
  const [autoRotate, setAutoRotate] = useState(false)
  const [canvasTheme, setCanvasTheme] = useState<StlCanvasTheme>(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
  )
  const [modelColor, setModelColor] = useState<StlModelColor>('default')
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)
  const [sampleName, setSampleName] = useState<string>()
  const modelName = uploadedFile?.name ?? sampleName ?? initialFileName

  function selectFile(file: File | undefined) {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.stl')) return
    setUploadedFile(file)
    setSampleName(undefined)
  }

  function loadSampleTooth() {
    setUploadedFile(undefined)
    setSampleName('Sample tooth.stl')
  }

  return (
    <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-canvas">
      <header className="shrink-0 border-b border-border bg-surface">
        <div className="flex min-h-navbar min-w-0 flex-wrap items-center gap-3 px-3 py-2">
          <div className="flex shrink-0 items-center gap-2">
            <img
              src="/images/novadontic_icon.png"
              alt=""
              className="size-7 object-contain"
            />
            <Brand context="3D Viewer" />
          </div>
          <input
            ref={uploadInputRef}
            type="file"
            accept=".stl,model/stl"
            className="hidden"
            aria-label="Upload an STL file"
            onChange={(event) => {
              selectFile(event.currentTarget.files?.[0])
              event.currentTarget.value = ''
            }}
          />

          <nav className="ms-auto flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 py-1" aria-label="3D viewer tools">
            <Button
              size="sm"
              variant="neutral"
              onClick={() => uploadInputRef.current?.click()}
            >
              <Upload />
              Upload STL
            </Button>
            <Button size="sm" variant="neutral" onClick={loadSampleTooth}>
              <Box />
              Sample tooth
            </Button>
            <span className="mx-0.5 h-7 w-px shrink-0 bg-border" aria-hidden="true" />
            <Button
              size="sm"
              variant="neutral"
              onClick={() => viewerRef.current?.resetView()}
            >
              <RotateCcw />
              Reset view
            </Button>
            <ViewerToggle
              icon={<Grid3X3 />}
              label="Wireframe"
              pressed={wireframe}
              onPressedChange={setWireframe}
            />
            <ViewerToggle
              icon={<Circle />}
              label="Flat shade"
              pressed={flatShading}
              onPressedChange={setFlatShading}
            />
            <ViewerToggle
              icon={<RotateCw />}
              label="Auto-rotate"
              pressed={autoRotate}
              onPressedChange={setAutoRotate}
            />
            <Button
              size="sm"
              variant={canvasTheme === 'light' ? 'secondary' : 'neutral'}
              aria-pressed={canvasTheme === 'light'}
              onClick={() => setCanvasTheme((current) => current === 'dark' ? 'light' : 'dark')}
            >
              <Sun />
              Light canvas
            </Button>
            <Button
              size="sm"
              variant="neutral"
              onClick={() => viewerRef.current?.takeSnapshot()}
            >
              <Camera />
              Snapshot
            </Button>
            <div className="relative">
              <Button
                type="button"
                size="icon-sm"
                variant="neutral"
                aria-label="Choose model color"
                aria-expanded={isPaletteOpen}
                onClick={() => setIsPaletteOpen((open) => !open)}
              >
                <span
                  className="size-5 rounded-xs border border-border"
                  style={{ backgroundColor: `var(--${modelColor})` }}
                />
              </Button>
              {isPaletteOpen && (
                <div
                  className="absolute end-0 top-full z-dropdown mt-2 flex gap-1.5 rounded-lg border border-border bg-surface-raised p-2 shadow-popover"
                  role="group"
                  aria-label="Model colors"
                >
                  {modelColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className="grid size-control-md place-items-center rounded-sm border border-border bg-surface hover:bg-surface-muted"
                      title={`${color.name} model color`}
                      aria-label={`${color.name} model color`}
                      aria-pressed={modelColor === color.value}
                      onClick={() => {
                        setModelColor(color.value)
                        setIsPaletteOpen(false)
                      }}
                    >
                      <span
                        className="size-4 rounded-full border border-border"
                        style={{
                          backgroundColor: color.value === 'default'
                            ? 'var(--surface)'
                            : `var(--${color.value})`,
                        }}
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <StlViewer
        ref={viewerRef}
        src={DEMO_STL_MODEL_URL}
        modelName={modelName}
        uploadedFile={uploadedFile}
        wireframe={wireframe}
        flatShading={flatShading}
        autoRotate={autoRotate}
        canvasTheme={canvasTheme}
        modelColor={modelColor}
        onUploadFile={selectFile}
      />
    </main>
  )
}

type ViewerToggleProps = {
  icon: ReactNode
  label: string
  pressed: boolean
  onPressedChange: (pressed: boolean) => void
}

function ViewerToggle({
  icon,
  label,
  pressed,
  onPressedChange,
}: ViewerToggleProps) {
  return (
    <Button
      size="sm"
      variant={pressed ? 'secondary' : 'neutral'}
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
    >
      {icon}
      {label}
    </Button>
  )
}
