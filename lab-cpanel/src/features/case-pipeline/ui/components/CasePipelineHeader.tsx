import { Flag, RotateCcw } from 'lucide-react'

import { Badge } from '../../../../shared/ui/Badge'
import { Button } from '../../../../shared/ui/Button'
import { Card } from '../../../../shared/ui/Card'
import type { CasePipelineCase } from '../../domain/casePipeline'

type CasePipelineHeaderProps = {
  caseItem: CasePipelineCase
  onToggleRush: () => void
  onSendBack: () => void
}

export function CasePipelineHeader({
  caseItem,
  onToggleRush,
  onSendBack,
}: CasePipelineHeaderProps) {
  const isRush = caseItem.priority === 'Rush'

  return (
    <Card className="gap-3 border-t-4 border-t-primary rounded-t-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Left: case identity */}
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary normal-case">
            {caseItem.id}
          </h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            {caseItem.request} · {caseItem.patientName} · {caseItem.doctorName} · {caseItem.clinicName}
          </p>

          {/* Status & identifier badges */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {/* Pipeline stage */}
            <Badge tone={caseItem.stage === 'Delivered' ? 'success' : 'info'}>
              {caseItem.stage}
            </Badge>

            {/* Rush flag */}
            {isRush && (
              <Badge
                tone="destructive"
                className="inline-flex items-center gap-1"
              >
                {/* Icon fixed to 12px — matches icon-size-sm token */}
                <Flag size={12} className="shrink-0" aria-hidden="true" />
                <span>Rush</span>
              </Badge>
            )}

            {/* Status (Needs attention / Due today / On track) */}
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

        {/* Right: actions */}
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
          <Button size="xs" variant="outline" onClick={onSendBack}>
            <RotateCcw />
            <span>Send back</span>
          </Button>

          <Button
            size="xs"
            variant={isRush ? 'danger' : 'outline'}
            onClick={onToggleRush}
          >
            <Flag />
            <span>{isRush ? 'Remove rush' : 'Mark as rush'}</span>
          </Button>

        </div>
      </div>
    </Card>
  )
}
