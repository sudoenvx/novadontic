import { lazy, Suspense } from 'react'

import { PageLoading } from '../../shared/ui/Loading'

const ModelViewerPage = lazy(async () => {
  const casePipeline = await import(
    '../../features/case-pipeline/ui/pages/ModelViewerPage'
  )
  return { default: casePipeline.ModelViewerPage }
})

export function ModelViewerRoute() {
  return (
    <Suspense
      fallback={<main className="min-h-dvh bg-canvas p-4"><PageLoading label="Loading model viewer" /></main>}
    >
      <ModelViewerPage />
    </Suspense>
  )
}
