import { Check, Flag, RotateCcw } from 'lucide-react'

import { Badge } from '../../../shared/ui/Badge'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { getNextStage } from '../domain/casePipeline'
import type { CasePipelineCase } from '../domain/casePipeline'

type CasePipelineHeaderProps = {
  caseItem: CasePipelineCase
  onMoveForward: () => void
  onRemoveRush: () => void
  onSendBack: () => void
}

export function CasePipelineHeader({
  caseItem,
  onMoveForward,
  onRemoveRush,
  onSendBack,
}: CasePipelineHeaderProps) {
  return (
    <Card size="sm" className="gap-3 border-t-4 rounded-t-sm border-t-accent">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold normal-case text-text">{caseItem.id}</h1>
          <p className="mt-1 text-sm text-secondary">
            {caseItem.request} for {caseItem.patientName} · {caseItem.doctorName} · {caseItem.clinicName}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone={caseItem.status === 'Needs attention' ? 'destructive' : 'info'}>
              {caseItem.stage}
            </Badge>
            {caseItem.priority === 'Rush' && (
              <Badge tone="destructive">
                <Flag />
                Rush
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <Button variant="neutral" onClick={onSendBack}>
            <RotateCcw />
            Send back
          </Button>
          {caseItem.priority === 'Rush' && (
            <Button variant="neutral" onClick={onRemoveRush}>
              <Flag />
              Remove rush
            </Button>
          )}
          <Button onClick={onMoveForward} disabled={caseItem.stage === 'Delivered'}>
            <Check />
            Move to {getNextStage(caseItem.stage)}
          </Button>
        </div>
      </div>
    </Card>
  )
}
