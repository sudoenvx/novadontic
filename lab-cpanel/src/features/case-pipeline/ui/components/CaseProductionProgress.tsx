import { Check } from 'lucide-react'

import { Card, CardHeader, CardTitle } from '../../../../shared/ui/Card'
import type { CasePipelineCase } from '../../domain/casePipeline'

export function CaseProductionProgress({ caseItem }: { caseItem: CasePipelineCase }) {
  const stages = caseItem.productionSteps
  const currentIndex = stages.findIndex((step) => step.status === 'active')

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Production progress</CardTitle>
      </CardHeader>
      <div className="overflow-x-auto pb-1">
        <div
          className="grid min-w-[580px] gap-1"
          style={{ gridTemplateColumns: `repeat(${Math.max(stages.length, 1)}, minmax(0, 1fr))` }}
        >
          {stages.map((stage, index) => {
            const isComplete = stage.status === 'completed' || index < currentIndex
            const isCurrent = currentIndex >= 0 && index === currentIndex

            return (
              <div key={stage.id} className="relative grid gap-1 text-center">
                {index < stages.length - 1 && (
                  <span
                    className={`absolute top-3 left-1/2 h-0.5 w-full ${index < currentIndex ? 'bg-primary' : 'bg-surface-muted'}`}
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`relative z-10 mx-auto grid size-6 place-items-center rounded-full border-2 ${isComplete ? 'border-primary bg-primary text-primary-foreground' : isCurrent ? 'border-primary bg-surface text-primary' : 'border-surface-muted bg-surface-muted text-text-muted'}`}
                >
                  {isComplete ? <Check className="size-3.5" /> : index + 1}
                </span>
                <span className={`text-xs font-semibold ${isCurrent ? 'text-text' : 'text-text-muted'}`}>
                  {stage.name}
                </span>
                {/* <span className="text-xs text-text-muted">
                  {isCurrent ? 'Current' : isComplete ? 'Completed' : 'Pending'}
                </span> */}
              </div>
            )
          })}
          {stages.length === 0 && (
            <p className="col-span-full text-center text-sm text-text-muted">
              No production stages are configured for this workflow.
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
