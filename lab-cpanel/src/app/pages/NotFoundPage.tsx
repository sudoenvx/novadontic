import { ArrowLeft, House, SearchX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Badge } from '../../shared/ui/Badge'
import { Button } from '../../shared/ui/Button'
import { Card } from '../../shared/ui/Card'
import { Page } from '../../shared/ui/Page'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <Page size="md" className="min-h-[65vh] items-center justify-center">
      <Card className="w-full max-w-lg items-center gap-4 p-8 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-primary-soft text-primary-soft-foreground">
          <SearchX aria-hidden="true" />
        </span>
        <Badge tone="info">404 · Page not found</Badge>
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold text-text">This page went off the map</h1>
          <p className="text-sm text-text-muted">The link may be outdated, or the page may have moved somewhere else in your workspace.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => navigate('/')}><House /> Go to dashboard</Button>
          <Button variant="neutral" onClick={() => navigate(-1)}><ArrowLeft /> Go back</Button>
        </div>
      </Card>
    </Page>
  )
}
