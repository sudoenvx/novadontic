import { useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { toast } from '../../../shared/ui/Toast'
import { Page } from '../../../shared/ui/Page'
import { casePipelineFixtures } from '../data/cases'
import { getNextStage, getPreviousStage } from '../domain/casePipeline'
import type {
  CasePipelineCase,
  CasePipelineStage,
} from '../domain/casePipeline'
import { CasePipelineHeader } from './CasePipelineHeader'
import { CasePipelineSidebarDetails } from './CasePipelineSidebarDetails'
import { CaseWorkflowStages } from './CaseWorkflowStages'

export function CasePipelinePage() {
  const { caseNumberCode } = useParams<{ caseNumberCode: string }>()
  const location = useLocation()
  const createdCase = (location.state as { caseItem?: CasePipelineCase } | null)?.caseItem
  const [cases, setCases] = useState<CasePipelineCase[]>(() =>
    createdCase ? [...casePipelineFixtures, createdCase] : casePipelineFixtures,
  )

  const selectedCase = cases.find((caseItem) => caseItem.id === caseNumberCode)

  function updateSelectedCase(update: (caseItem: CasePipelineCase) => CasePipelineCase) {
    if (!selectedCase) {
      return
    }

    setCases((currentCases) =>
      currentCases.map((caseItem) =>
        caseItem.id === selectedCase.id ? update(caseItem) : caseItem,
      ),
    )
  }

  function moveSelectedCase(stage: CasePipelineStage) {
    updateSelectedCase((caseItem) => ({ ...caseItem, stage }))
    toast.add({
      title: 'Case pipeline updated',
      description: `Case moved to ${stage}.`,
      type: 'success',
    })
  }

  function handleToggleRush() {
    if (!selectedCase) return
    const isRush = selectedCase.priority === 'Rush'
    const nextPriority = isRush ? 'Normal' : 'Rush'

    updateSelectedCase((caseItem) => ({ ...caseItem, priority: nextPriority }))
    toast.add({
      title: isRush ? 'Rush priority removed' : 'Case marked as Rush',
      description: isRush
        ? 'Case priority set to Normal schedule.'
        : 'Case prioritized for rush turnaround schedule.',
      type: isRush ? 'info' : 'warning',
    })
  }

  if (!selectedCase) {
    return (
      <Page size="full">
        <p className="rounded-md bg-surface px-4 py-10 text-center text-sm text-text-muted">
          This case could not be found.
        </p>
      </Page>
    )
  }

  return (
    <Page size="full">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <main className="grid min-w-0 gap-3.5">
          <CasePipelineHeader
            caseItem={selectedCase}
            onMoveForward={() => moveSelectedCase(getNextStage(selectedCase.stage))}
            onToggleRush={handleToggleRush}
            onSendBack={() => moveSelectedCase(getPreviousStage(selectedCase.stage))}
          />

          <CaseWorkflowStages
            caseItem={selectedCase}
            onUpdateSteps={(steps) =>
              updateSelectedCase((caseItem) => ({
                ...caseItem,
                productionSteps: steps,
              }))
            }
            onUpdateStage={moveSelectedCase}
          />
        </main>
        <CasePipelineSidebarDetails caseItem={selectedCase} />
      </div>
    </Page>
  )
}
