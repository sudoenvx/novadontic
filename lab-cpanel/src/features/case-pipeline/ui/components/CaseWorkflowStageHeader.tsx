import { Badge } from '../../../../shared/ui/Badge'
import type { CaseProductionStep } from '../../domain/casePipeline'

type CaseWorkflowStageHeaderProps = {
  steps: CaseProductionStep[]
}

export function CaseWorkflowStageHeader({ steps }: CaseWorkflowStageHeaderProps) {
  const completedCount = steps.filter((step) => step.status === 'completed').length

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h2 className="text-base font-extrabold text-text-primary">Workflow stages</h2>
        <p className="mt-0.5 text-sm text-text-secondary">
          Track stage execution, technician assignments, and files.
        </p>
      </div>
      <Badge tone={completedCount === steps.length ? 'success' : 'accent'}>
        {completedCount} of {steps.length} stages completed
      </Badge>
    </div>
  )
}
