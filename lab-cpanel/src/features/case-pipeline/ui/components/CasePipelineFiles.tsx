import { Download, FileBox, Trash2 } from 'lucide-react'

import { Button } from '../../../../shared/ui/Button'
import { Card, CardHeader, CardTitle } from '../../../../shared/ui/Card'
import type { CasePipelineCase } from '../../domain/casePipeline'

export function CasePipelineFiles({ caseItem }: { caseItem: CasePipelineCase }) {
  const files = caseItem.productionSteps.flatMap((step) => step.files)

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Files</CardTitle>
        <p className="text-sm text-text-muted">Every scan, setup, and production file for this case.</p>
      </CardHeader>
      <div className="grid gap-1.5">
        {files.length > 0 ? files.map((file) => (
          <div key={file.id} className="flex items-center gap-2 rounded-sm bg-surface-muted/70 px-2.5 py-2">
            <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-primary-soft text-primary"><FileBox className="size-4" /></span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text">{file.name}</p>
              <p className="text-xs text-text-muted">{file.size} · {file.uploadedBy} · {file.uploadedAt}</p>
            </div>
            <Button variant="ghost" size="icon-sm" aria-label={`Download ${file.name}`}><Download /></Button>
            <Button variant="ghost" size="icon-sm" aria-label={`Delete ${file.name}`}><Trash2 /></Button>
          </div>
        )) : <p className="py-5 text-center text-sm text-text-muted">No files have been uploaded yet.</p>}
      </div>
    </Card>
  )
}
