import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import type {
  Color,
  Material,
  Mesh,
  Object3D,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
  MOUSE as MouseButton,
} from 'three'
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { ModelRendererHandle, ModelRendererProps } from './ModelRenderer'
import { getModelFormat } from '../lib/modelFormats'

type RendererMaterial = Material & {
  color?: Color
  flatShading?: boolean
  wireframe?: boolean
}

type RendererController = {
  camera: PerspectiveCamera
  controls: OrbitControls
  renderer: WebGLRenderer
  scene: Scene
  background: Color
  model: Object3D
  initialCameraPosition: Vector3
  initialTarget: Vector3
  originalMaterialColors: WeakMap<Material, Color>
  rotateMouseButton: MouseButton
  panMouseButton: MouseButton
}

function getCssColor(value: string) {
  const color = value.startsWith('--')
    ? getComputedStyle(document.documentElement).getPropertyValue(value).trim()
    : value
  if (!color) throw new Error(`The design token "${value}" has no color value.`)
  return color
}

function isMeshObject(object: Object3D): object is Mesh {
  return 'isMesh' in object && object.isMesh === true
}

function getMaterials(object: Object3D) {
  const materials: Material[] = []
  object.traverse((child) => {
    if (!isMeshObject(child)) return
    materials.push(...(Array.isArray(child.material) ? child.material : [child.material]))
  })
  return materials
}

function disposeModel(object: Object3D) {
  const geometries = new Set<Mesh['geometry']>()
  const materials = new Set<Material>()

  object.traverse((child) => {
    if (!isMeshObject(child)) return
    geometries.add(child.geometry)
    for (const material of Array.isArray(child.material) ? child.material : [child.material]) {
      materials.add(material)
    }
  })

  for (const geometry of geometries) geometry.dispose()
  for (const material of materials) material.dispose()
}

function applySettings(
  controller: RendererController,
  settings: ModelRendererProps['settings'],
) {
  controller.controls.autoRotate = settings.autoRotate
  controller.controls.mouseButtons.LEFT = settings.panMode
    ? controller.panMouseButton
    : controller.rotateMouseButton
  controller.controls.mouseButtons.RIGHT = settings.panMode
    ? controller.rotateMouseButton
    : controller.panMouseButton
  const selectedColor = settings.modelColor
    ? getCssColor(settings.modelColor)
    : undefined

  for (const material of getMaterials(controller.model)) {
    const rendererMaterial = material as RendererMaterial
    if (rendererMaterial.wireframe !== undefined) {
      if (rendererMaterial.wireframe !== settings.wireframe) {
        rendererMaterial.wireframe = settings.wireframe
        material.needsUpdate = true
      }
    }
    if (rendererMaterial.flatShading !== undefined) {
      if (rendererMaterial.flatShading !== settings.flatShading) {
        rendererMaterial.flatShading = settings.flatShading
        material.needsUpdate = true
      }
    }
    if (rendererMaterial.color) {
      const originalColor = controller.originalMaterialColors.get(material)
      if (selectedColor) rendererMaterial.color.set(selectedColor)
      else if (originalColor) rendererMaterial.color.copy(originalColor)
    }
  }

  const backgroundColor = getCssColor(settings.backgroundColor)
  controller.background.set(backgroundColor)
  controller.renderer.setClearColor(backgroundColor)
}

async function getModelResponse(source: ModelRendererProps['source']) {
  if (!source.url) throw new Error(`No model file was provided for "${source.name}".`)

  const response = await fetch(source.url)
  if (!response.ok) {
    throw new Error(`The model could not be downloaded (${response.status}).`)
  }
  return response
}

async function fetchModelBuffer(source: ModelRendererProps['source']) {
  if (source.file) return source.file.arrayBuffer()
  const response = await getModelResponse(source)
  return response.arrayBuffer()
}

async function fetchModelText(source: ModelRendererProps['source']) {
  if (source.file) return source.file.text()
  const response = await getModelResponse(source)
  return response.text()
}

async function loadModel(
  three: typeof import('three'),
  source: ModelRendererProps['source'],
): Promise<Object3D> {
  const format = getModelFormat(source.name)
  if (!format) {
    throw new Error('Supported 3D model formats are STL, OBJ, PLY, and 3MF.')
  }

  switch (format) {
    case 'stl': {
      const { STLLoader } = await import('three/addons/loaders/STLLoader.js')
      const geometry = new STLLoader().parse(await fetchModelBuffer(source))
      geometry.computeVertexNormals()
      return createDefaultMesh(three, geometry)
    }
    case 'obj': {
      const { OBJLoader } = await import('three/addons/loaders/OBJLoader.js')
      return new OBJLoader().parse(await fetchModelText(source))
    }
    case 'ply': {
      const { PLYLoader } = await import('three/addons/loaders/PLYLoader.js')
      const geometry = new PLYLoader().parse(await fetchModelBuffer(source))
      geometry.computeVertexNormals()
      return createDefaultMesh(three, geometry)
    }
    case '3mf': {
      const { ThreeMFLoader } = await import('three/addons/loaders/3MFLoader.js')
      return new ThreeMFLoader().parse(await fetchModelBuffer(source))
    }
  }
}

function createDefaultMesh(
  three: typeof import('three'),
  geometry: import('three').BufferGeometry,
) {
  return new three.Mesh(
    geometry,
    new three.MeshStandardMaterial({
      color: getCssColor('--neutral-400'),
      vertexColors: geometry.hasAttribute('color'),
    }),
  )
}

export const ThreeModelRenderer = forwardRef<
  ModelRendererHandle,
  ModelRendererProps
>(function ThreeModelRenderer(
  { source, settings, onLoad, onError },
  forwardedRef,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<RendererController | null>(null)
  const settingsRef = useRef(settings)
  const onLoadRef = useRef(onLoad)
  const onErrorRef = useRef(onError)
  settingsRef.current = settings
  onLoadRef.current = onLoad
  onErrorRef.current = onError

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
      const download = document.createElement('a')
      download.download = `${source.name.replace(/\.[^.]+$/, '')}-snapshot.png`
      download.href = controller.renderer.domElement.toDataURL('image/png')
      download.click()
    },
  }), [source.name])

  useEffect(() => {
    let isDisposed = false
    let renderer: WebGLRenderer | undefined
    let controls: OrbitControls | undefined
    let model: Object3D | undefined
    let resizeObserver: ResizeObserver | undefined
    let themeObserver: MutationObserver | undefined

    async function initializeRenderer() {
      const container = containerRef.current
      if (!container) return

      try {
        const [three, { OrbitControls }] = await Promise.all([
          import('three'),
          import('three/addons/controls/OrbitControls.js'),
        ])
        if (isDisposed) return

        const scene = new three.Scene()
        const camera = new three.PerspectiveCamera(45, 1, 0.01, 10_000)
        const background = new three.Color(getCssColor(settingsRef.current.backgroundColor))
        scene.background = background
        const light = new three.Color(0xffffff)
        const fill = new three.Color(getCssColor('--surface-muted'))
        const keyLight = new three.DirectionalLight(light, 2.5)
        keyLight.position.set(3, 5, 4)
        scene.add(
          new three.AmbientLight(light, 1.4),
          new three.HemisphereLight(light, fill, 1.2),
          keyLight,
        )

        const webglRenderer = new three.WebGLRenderer({
          antialias: true,
          preserveDrawingBuffer: true,
        })
        renderer = webglRenderer
        webglRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
        webglRenderer.setClearColor(getCssColor(settingsRef.current.backgroundColor))
        webglRenderer.domElement.setAttribute('role', 'img')
        webglRenderer.domElement.setAttribute('aria-label', `${source.name} 3D model`)
        container.replaceChildren(webglRenderer.domElement)

        const orbitControls = new OrbitControls(camera, webglRenderer.domElement)
        controls = orbitControls
        orbitControls.enableDamping = true
        orbitControls.dampingFactor = 0.08
        orbitControls.enableRotate = true
        orbitControls.enablePan = true
        orbitControls.enableZoom = true
        orbitControls.screenSpacePanning = true
        webglRenderer.domElement.style.touchAction = 'none'

        function resizeRenderer() {
          const element = containerRef.current
          if (!element) return
          const { clientHeight, clientWidth } = element
          if (!clientWidth || !clientHeight) return
          camera.aspect = clientWidth / clientHeight
          camera.updateProjectionMatrix()
          webglRenderer.setSize(clientWidth, clientHeight)
        }

        resizeObserver = new ResizeObserver(resizeRenderer)
        resizeObserver.observe(container)
        resizeRenderer()

        const loadedModel = await loadModel(three, source)
        if (isDisposed) {
          disposeModel(loadedModel)
          return
        }

        model = loadedModel
        const bounds = new three.Box3().setFromObject(loadedModel)
        if (bounds.isEmpty()) throw new Error('The 3D model does not contain renderable geometry.')

        const dimensions = bounds.getSize(new three.Vector3())
        const center = bounds.getCenter(new three.Vector3())

        const largestDimension = Math.max(dimensions.x, dimensions.y, dimensions.z)
        if (!Number.isFinite(largestDimension) || largestDimension <= 0) {
          throw new Error('The 3D model has invalid dimensions.')
        }

        const radius = bounds.getBoundingSphere(new three.Sphere()).radius
        const cameraDistance = (radius / Math.sin((camera.fov * Math.PI) / 360)) * 1.15
        const cameraOffset = new three.Vector3(
          cameraDistance,
          cameraDistance,
          cameraDistance,
        ).normalize().multiplyScalar(cameraDistance)
        const initialCameraPosition = center.clone().add(cameraOffset)
        camera.position.copy(initialCameraPosition)
        camera.near = Math.max(largestDimension / 1000, 0.001)
        camera.far = largestDimension * 100
        camera.updateProjectionMatrix()
        orbitControls.minDistance = largestDimension * 0.2
        orbitControls.maxDistance = largestDimension * 12
        orbitControls.target.copy(center)
        orbitControls.update()

        scene.add(loadedModel)
        const originalMaterialColors = new WeakMap<Material, Color>()
        for (const material of getMaterials(loadedModel)) {
          const rendererMaterial = material as RendererMaterial
          if (rendererMaterial.color) {
            originalMaterialColors.set(material, rendererMaterial.color.clone())
          }
        }
        const controller: RendererController = {
          camera,
          controls: orbitControls,
          renderer: webglRenderer,
          scene,
          background,
          model: loadedModel,
          initialCameraPosition,
          initialTarget: center.clone(),
          originalMaterialColors,
          rotateMouseButton: three.MOUSE.ROTATE,
          panMouseButton: three.MOUSE.PAN,
        }
        controllerRef.current = controller
        applySettings(controller, settingsRef.current)
        themeObserver = new MutationObserver(() => {
          applySettings(controller, settingsRef.current)
        })
        themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['data-theme'],
        })
        webglRenderer.setAnimationLoop(() => {
          orbitControls.update()
          webglRenderer.render(scene, camera)
        })

        let triangles = 0
        let vertices = 0
        loadedModel.traverse((child) => {
          if (!isMeshObject(child)) return
          const positions = child.geometry.getAttribute('position')
          const index = child.geometry.getIndex()
          vertices += positions.count
          triangles += Math.floor((index?.count ?? positions.count) / 3)
        })

        onLoadRef.current({
          triangles,
          vertices,
          width: dimensions.x,
          depth: dimensions.y,
          height: dimensions.z,
        })
      } catch (error) {
        if (!isDisposed) {
          onErrorRef.current(
            error instanceof Error
              ? error.message
              : 'The 3D model could not be rendered.',
          )
        }
      }
    }

    void initializeRenderer()
    return () => {
      isDisposed = true
      controllerRef.current = null
      resizeObserver?.disconnect()
      themeObserver?.disconnect()
      renderer?.setAnimationLoop(null)
      controls?.dispose()
      if (model) disposeModel(model)
      renderer?.dispose()
      renderer?.domElement.remove()
    }
  }, [source])

  useEffect(() => {
    const controller = controllerRef.current
    if (controller) applySettings(controller, settings)
  }, [settings])

  return <div ref={containerRef} className="absolute inset-0" />
})
