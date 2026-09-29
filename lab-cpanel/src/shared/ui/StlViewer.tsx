import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import {
  AmbientLight,
  Color,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
  type BufferGeometry,
} from 'three'
import { Info } from 'lucide-react'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { STLLoader } from 'three/addons/loaders/STLLoader.js'
import type { DragEvent } from 'react'

export type StlViewerHandle = {
  resetView: () => void
  takeSnapshot: () => void
}

export type StlCanvasTheme = 'dark' | 'light'
export type StlModelColor =
  | 'default'
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'destructive'

type StlViewerProps = {
  src: string
  modelName: string
  uploadedFile?: File
  wireframe: boolean
  flatShading: boolean
  autoRotate: boolean
  canvasTheme: StlCanvasTheme
  modelColor: StlModelColor
  onUploadFile: (file: File) => void
}

type ModelStats = {
  triangles: number
  vertices: number
  width: number
  depth: number
  height: number
}

type ViewerController = {
  camera: PerspectiveCamera
  controls: OrbitControls
  renderer: WebGLRenderer
  scene: Scene
  model: Mesh<BufferGeometry, MeshStandardMaterial>
  initialCameraPosition: Vector3
  initialTarget: Vector3
}

type ViewerSettings = {
  wireframe: boolean
  flatShading: boolean
  autoRotate: boolean
  canvasTheme: StlCanvasTheme
  modelColor: StlModelColor
}

const modelColorTokens: Record<Exclude<StlModelColor, 'default'>, string> = {
  primary: '--primary',
  accent: '--accent',
  success: '--success',
  warning: '--warning',
  destructive: '--destructive',
}

function getTokenColor(token: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim()
}

function isStlFile(file: File) {
  return file.name.toLowerCase().endsWith('.stl')
}

export const StlViewer = forwardRef<StlViewerHandle, StlViewerProps>(
  function StlViewer(
    {
      src,
      modelName,
      uploadedFile,
      wireframe,
      flatShading,
      autoRotate,
      canvasTheme,
      modelColor,
      onUploadFile,
    },
    forwardedRef,
  ) {
    const containerRef = useRef<HTMLDivElement>(null)
    const controllerRef = useRef<ViewerController | null>(null)
    const settingsRef = useRef<ViewerSettings>({
      wireframe,
      flatShading,
      autoRotate,
      canvasTheme,
      modelColor,
    })
    const [modelStats, setModelStats] = useState<ModelStats>()
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState<string>()
    const [showModelInfo, setShowModelInfo] = useState(true)

    useEffect(() => {
      settingsRef.current = { wireframe, flatShading, autoRotate, canvasTheme, modelColor }
    }, [autoRotate, canvasTheme, flatShading, modelColor, wireframe])

    useImperativeHandle(forwardedRef, () => ({
      resetView() {
        const controller = controllerRef.current
        if (!controller) return
        controller.camera.position.copy(controller.initialCameraPosition)
        controller.controls.target.copy(controller.initialTarget)
        controller.controls.update()
      },
      takeSnapshot() {
        const controller = controllerRef.current
        if (!controller) return
        controller.renderer.render(controller.scene, controller.camera)

        const downloadLink = document.createElement('a')
        downloadLink.download = `${modelName.replace(/\.stl$/i, '')}-snapshot.png`
        downloadLink.href = controller.renderer.domElement.toDataURL('image/png')
        downloadLink.click()
      },
    }), [modelName])

    useEffect(() => {
      let isDisposed = false
      let renderer: WebGLRenderer | undefined
      let controls: OrbitControls | undefined
      let resizeObserver: ResizeObserver | undefined
      let model: Mesh<BufferGeometry, MeshStandardMaterial> | undefined

      async function initializeViewer() {
        const container = containerRef.current
        if (!container || isDisposed) return

        setModelStats(undefined)
        setErrorMessage(undefined)
        setIsLoading(true)

        const scene = new Scene()
        const camera = new PerspectiveCamera(45, 1, 0.01, 10_000)
        const currentSettings = settingsRef.current
        const surfaceColor = new Color(getCanvasColor(currentSettings.canvasTheme))
        const lightColor = new Color(getTokenColor('--surface'))
        const groundColor = new Color(getTokenColor('--surface-muted'))
        scene.background = surfaceColor

        const keyLight = new DirectionalLight(lightColor, 2.5)
        keyLight.position.set(3, 5, 4)
        scene.add(
          new AmbientLight(lightColor, 1.4),
          new HemisphereLight(lightColor, groundColor, 1.2),
          keyLight,
        )

        let activeRenderer: WebGLRenderer
        let activeControls: OrbitControls
        try {
          activeRenderer = new WebGLRenderer({
            antialias: true,
            preserveDrawingBuffer: true,
          })
          activeControls = new OrbitControls(camera, activeRenderer.domElement)
        } catch {
          setErrorMessage('A WebGL-capable browser is required to view this model.')
          setIsLoading(false)
          return
        }

        renderer = activeRenderer
        controls = activeControls
        activeRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
        activeRenderer.domElement.setAttribute('role', 'img')
        activeRenderer.domElement.setAttribute('aria-label', `${modelName} 3D model`)
        container.replaceChildren(activeRenderer.domElement)

        function resizeViewer() {
          const currentContainer = containerRef.current
          if (!currentContainer) return

          const { clientHeight, clientWidth } = currentContainer
          if (!clientWidth || !clientHeight) return

          camera.aspect = clientWidth / clientHeight
          camera.updateProjectionMatrix()
          activeRenderer.setSize(clientWidth, clientHeight, false)
        }

        resizeObserver = new ResizeObserver(resizeViewer)
        resizeObserver.observe(container)
        resizeViewer()

        activeControls.enableDamping = true
        activeControls.dampingFactor = 0.08
        activeControls.autoRotate = currentSettings.autoRotate
        activeControls.update()
        activeRenderer.setAnimationLoop(() => {
          activeControls.update()
          activeRenderer.render(scene, camera)
        })

        try {
          const geometry = uploadedFile
            ? new STLLoader().parse(await uploadedFile.arrayBuffer())
            : await new STLLoader().loadAsync(src)
          if (isDisposed) {
            geometry.dispose()
            return
          }

          geometry.computeVertexNormals()
          geometry.computeBoundingBox()
          const bounds = geometry.boundingBox
          if (!bounds) throw new Error('The STL file does not contain a 3D model.')

          const dimensions = bounds.getSize(new Vector3())
          const center = bounds.getCenter(new Vector3())
          geometry.translate(-center.x, -center.y, -center.z)

          const largestDimension = Math.max(
            dimensions.x,
            dimensions.y,
            dimensions.z,
          )
          const cameraDistance = (largestDimension * 1.8) / Math.tan(
            (camera.fov * Math.PI) / 360,
          )
          const initialCameraPosition = new Vector3(
            cameraDistance,
            cameraDistance,
            cameraDistance,
          )

          camera.position.copy(initialCameraPosition)
          camera.near = Math.max(largestDimension / 1000, 0.001)
          camera.far = largestDimension * 100
          camera.updateProjectionMatrix()
          activeControls.minDistance = largestDimension * 0.2
          activeControls.maxDistance = largestDimension * 12
          activeControls.target.set(0, 0, 0)
          activeControls.update()

          const latestSettings = settingsRef.current
          const material = new MeshStandardMaterial({
            color: getModelColor(latestSettings.modelColor),
            flatShading: latestSettings.flatShading,
            wireframe: latestSettings.wireframe,
            metalness: 0.08,
            roughness: 0.48,
          })
          model = new Mesh(geometry, material)
          scene.add(model)

          controllerRef.current = {
            camera,
            controls: activeControls,
            renderer: activeRenderer,
            scene,
            model,
            initialCameraPosition,
            initialTarget: new Vector3(),
          }
          const positionCount = geometry.getAttribute('position').count
          setModelStats({
            triangles: Math.floor(positionCount / 3),
            vertices: positionCount,
            width: dimensions.x,
            depth: dimensions.y,
            height: dimensions.z,
          })
          setIsLoading(false)
        } catch (error) {
          if (isDisposed) return
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'The STL model could not be loaded.',
          )
          setIsLoading(false)
        }
      }

      queueMicrotask(() => void initializeViewer())

      return () => {
        isDisposed = true
        controllerRef.current = null
        resizeObserver?.disconnect()
        renderer?.setAnimationLoop(null)
        controls?.dispose()
        if (model) {
          model.geometry.dispose()
          if (Array.isArray(model.material)) {
            model.material.forEach((material) => material.dispose())
          } else {
            model.material.dispose()
          }
        }
        renderer?.dispose()
        renderer?.domElement.remove()
      }
    }, [modelName, src, uploadedFile])

    useEffect(() => {
      const controller = controllerRef.current
      if (!controller) return
      controller.controls.autoRotate = autoRotate
      controller.model.material.wireframe = wireframe
      controller.model.material.flatShading = flatShading
      controller.model.material.color.copy(getModelColor(modelColor))
      const canvasColor = getCanvasColor(canvasTheme)
      controller.scene.background = new Color(canvasColor)
      controller.renderer.setClearColor(canvasColor)
      controller.model.material.needsUpdate = true
    }, [autoRotate, canvasTheme, flatShading, modelColor, modelStats, wireframe])

    useEffect(() => {
      const controller = controllerRef.current
      if (!controller) return

      const themeObserver = new MutationObserver(() => {
        const canvasColor = getCanvasColor(canvasTheme)
        controller.scene.background = new Color(canvasColor)
        controller.renderer.setClearColor(canvasColor)
      })
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      })
      return () => themeObserver.disconnect()
    }, [canvasTheme, modelStats])

    function handleDrop(event: DragEvent<HTMLDivElement>) {
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      if (!file) return
      if (!isStlFile(file)) {
        setErrorMessage('Only STL files can be viewed here.')
        return
      }
      onUploadFile(file)
    }

    return (
      <div
        className="relative min-h-0 flex-1 overflow-hidden"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <div ref={containerRef} className="absolute inset-0" />
        {isLoading && !errorMessage && (
          <p
            className="absolute inset-0 grid place-items-center bg-canvas text-sm text-text-secondary"
            role="status"
          >
            Loading 3D model…
          </p>
        )}
        {errorMessage && (
          <p
            className="absolute inset-0 grid place-items-center bg-canvas px-6 text-center text-sm text-destructive"
            role="alert"
          >
            {errorMessage}
          </p>
        )}
        {!isLoading && !errorMessage && modelStats && (
          <>
            {showModelInfo && (
              <section
                className="absolute bottom-3 left-3 w-[min(17rem,calc(100%-1.5rem))] rounded-lg border border-border bg-surface p-3 shadow-float"
                aria-label="Model information"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-text-secondary">Model</p>
                  <button
                    type="button"
                    className="grid size-control-sm place-items-center rounded-sm text-text-muted hover:bg-surface-muted hover:text-text-primary"
                    aria-label="Hide model information"
                    onClick={() => setShowModelInfo(false)}
                  >
                    ×
                  </button>
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
            )}
            {!showModelInfo && (
              <button
                type="button"
                className="absolute bottom-3 left-3 grid size-control-md place-items-center rounded-full border border-border bg-white text-info shadow-float transition hover:bg-surface-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                aria-label="Show model information"
                title={`Show information for ${modelName}`}
                onClick={() => setShowModelInfo(true)}
              >
                <Info className="size-4" aria-hidden="true" />
              </button>
            )}
            <p className="absolute bottom-3 right-3 hidden max-w-60 items-start gap-2 rounded-lg border border-border bg-surface p-3 text-xs text-text-secondary shadow-float sm:flex">
              <span className="font-semibold text-primary" aria-hidden="true">↕</span>
              <span>Drag to orbit, scroll to zoom, right-drag to pan. Drop your own STL file anywhere here.</span>
            </p>
          </>
        )}
      </div>
    )
  },
)

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

function getCanvasColor(theme: StlCanvasTheme) {
  return getTokenColor(theme === 'dark' ? '--stl-viewer-canvas-dark' : '--stl-viewer-canvas-light')
}

function getModelColor(color: StlModelColor) {
  return new Color(color === 'default' ? 0xffffff : getTokenColor(modelColorTokens[color]))
}
