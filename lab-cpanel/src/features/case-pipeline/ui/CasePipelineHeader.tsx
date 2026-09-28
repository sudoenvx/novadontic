import { Check, Flag, RotateCcw } from 'lucide-react'

import { Badge } from '../../../shared/ui/Badge'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { getNextStage } from '../domain/casePipeline'
import type { CasePipelineCase } from '../domain/casePipeline'

type CasePipelineHeaderProps = {
  caseItem: CasePipelineCase
  onMoveForward: () => void
  onToggleRush: () => void
  onSendBack: () => void
}

export function CasePipelineHeader({
  caseItem,
  onMoveForward,
  onToggleRush,
  onSendBack,
}: CasePipelineHeaderProps) {
  const isRush = caseItem.priority === 'Rush'

  return (
    <Card  className="gap-3 border-t-4 rounded-t-sm border-t-accent">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold normal-case text-text">{caseItem.id}</h1>
          <p className="mt-1 text-sm text-secondary">
            {caseItem.request} for {caseItem.patientName} · {caseItem.doctorName} · {caseItem.clinicName}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <Badge tone={caseItem.stage === 'Delivered' ? 'success' : 'info'}>
              {caseItem.stage}
            </Badge>
            <Badge tone="neutral">
              {caseItem.caseType}
            </Badge>
            <Badge tone="accent">
              {caseItem.categoryName ?? caseItem.categoryId ?? 'New case'}
            </Badge>
            {isRush && (
              <Badge tone="destructive" className="gap-1 inline-flex items-center">
                <Flag size={11} className="shrink-0" aria-hidden="true" />
                <span>Rush</span>
              </Badge>
            )}
            <Badge
              tone={
                caseItem.status === 'Needs attention'
                  ? 'destructive'
                  : caseItem.status === 'Due today'
                  ? 'warning'
                  : 'success'
              }
            >
              {caseItem.status}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <Button variant="neutral" onClick={onSendBack}>
            <RotateCcw size={13} className="shrink-0" />
            <span>Send back</span>
          </Button>

          <Button
            variant={isRush ? 'destructive' : 'neutral'}
            onClick={onToggleRush}
            className="gap-1.5"
          >
            <Flag size={13} className="shrink-0" />
            <span>{isRush ? 'Remove rush' : 'Mark as rush'}</span>
          </Button>

          <Button onClick={onMoveForward} disabled={caseItem.stage === 'Delivered'}>
            <Check size={13} className="shrink-0" />
            <span>Move to {getNextStage(caseItem.stage)}</span>
          </Button>
        </div>
      </div>
    </Card>
  )
}
