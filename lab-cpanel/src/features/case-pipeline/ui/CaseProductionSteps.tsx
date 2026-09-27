import { Check, ChevronDown, FileUp } from 'lucide-react'

import { Button } from '../../../shared/ui/Button'
import { Card, CardHeader, CardTitle } from '../../../shared/ui/Card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/Select'
import type { CasePipelineCase, CaseProductionStep } from '../domain/casePipeline'

type CaseProductionStepsProps = {
  caseItem: CasePipelineCase
  onAssignTechnician: (stepId: string, technician: string) => void
  onMarkDone: (stepId: string) => void
  onUpload: (step: CaseProductionStep) => void
}

export function CaseProductionSteps({
  caseItem,
  onAssignTechnician,
  onMarkDone,
  onUpload,
}: CaseProductionStepsProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Production steps</CardTitle>
        <p className="text-sm text-text-muted">Upload scans, design, and production files for each step.</p>
      </CardHeader>
      <div className="grid gap-1.5">
        {caseItem.productionSteps.length > 0 ? (
          caseItem.productionSteps.map((step) => (
            <ProductionStep
              key={step.id}
              step={step}
              onAssignTechnician={(technician) => onAssignTechnician(step.id, technician)}
              onMarkDone={() => onMarkDone(step.id)}
              onUpload={() => onUpload(step)}
            />
          ))
        ) : (
          <p className="rounded-sm bg-surface-muted px-3 py-6 text-center text-sm text-text-muted">
            Production steps will appear as this case is received.
          </p>
        )}
      </div>
    </Card>
  )
}

function ProductionStep({
  onAssignTechnician,
  onMarkDone,
  onUpload,
  step,
}: {
  onAssignTechnician: (technician: string) => void
  onMarkDone: () => void
  onUpload: () => void
  step: CaseProductionStep
}) {
  const isOpen = step.status === 'active' || step.status === 'completed'

  return (
    <details open={isOpen} className="group rounded-sm bg-surface-muted/70 px-2.5 py-2">
      <summary className="flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
        <span className={`grid size-6 place-items-center rounded-full text-xs font-semibold ${step.status === 'completed' ? 'bg-primary text-primary-foreground' : step.status === 'active' ? 'bg-accent text-accent-foreground' : 'bg-surface text-text-muted'}`}>
          {step.status === 'completed' ? <Check className="size-3.5" /> : step.name === 'Received' ? '1' : step.name[0]}
        </span>
        <span className="font-semibold text-text">{step.name}</span>
        <span className="text-xs text-text-muted">{step.files.length} {step.files.length === 1 ? 'file' : 'files'}</span>
        <ChevronDown className="ml-auto size-4 text-text-muted transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-2 grid gap-2 border-t border-border-subtle pt-2">
        <button
          type="button"
          className="rounded-sm bg-surface px-3 py-3 text-sm text-secondary hover:bg-primary-soft"
          onClick={onUpload}
        >
          <FileUp className="mr-1.5 inline size-4 text-primary" />
          Add scan, photo, or PDF
        </button>
        {step.files.map((file) => (
          <div key={file.id} className="flex items-center justify-between gap-2 rounded-sm bg-surface px-2.5 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text">{file.name}</p>
              <p className="text-xs text-text-muted">{file.size} · {file.uploadedBy} · {file.uploadedAt}</p>
            </div>
            <span className="rounded-xs bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold text-primary-soft-foreground">{file.type}</span>
          </div>
        ))}
        <div className="grid gap-1.5 sm:grid-cols-[auto_minmax(0,16rem)_auto] sm:items-center">
          <span className="text-xs text-text-muted">Assigned technician</span>
          <Select value={step.technician ?? 'unassigned'} onValueChange={(value) => onAssignTechnician(value ?? 'unassigned')}>
            <SelectTrigger size="default" className="w-full">
              <SelectValue placeholder="Assign technician" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              <SelectItem value="Mina S.">Mina S.</SelectItem>
              <SelectItem value="Ahmed R.">Ahmed R.</SelectItem>
              <SelectItem value="Dina Amer">Dina Amer</SelectItem>
            </SelectContent>
          </Select>
          {step.status === 'active' && <Button onClick={onMarkDone}>Mark done</Button>}
        </div>
      </div>
    </details>
  )
}
