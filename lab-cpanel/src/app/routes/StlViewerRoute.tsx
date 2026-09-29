import { lazy, Suspense } from 'react'

const StlViewerPage = lazy(async () => {
  const casePipeline = await import(
    '../../features/case-pipeline/ui/pages/StlViewerPage'
  )
  return { default: casePipeline.StlViewerPage }
})

export function StlViewerRoute() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-dvh place-items-center bg-canvas text-sm text-text-secondary">
          Loading 3D viewer…
        </main>
      }
    >
      <StlViewerPage />
    </Suspense>
  )
}
