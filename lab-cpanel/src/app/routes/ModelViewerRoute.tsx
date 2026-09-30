import { lazy, Suspense } from 'react'

const ModelViewerPage = lazy(async () => {
  const casePipeline = await import(
    '../../features/case-pipeline/ui/pages/ModelViewerPage'
  )
  return { default: casePipeline.ModelViewerPage }
})

export function ModelViewerRoute() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-dvh place-items-center bg-canvas text-sm text-text-secondary">
          Loading model viewer…
        </main>
      }
    >
      <ModelViewerPage />
    </Suspense>
  )
}
