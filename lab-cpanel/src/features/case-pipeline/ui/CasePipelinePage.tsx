import { useState } from 'react'

import { toast } from '../../../shared/ui/Toast'
import { Page } from '../../../shared/ui/Page'
import { casePipelineFixtures } from '../data/cases'
import {
  filterCasePipelineCases,
  getNextStage,
  getPreviousStage,
} from '../domain/casePipeline'
import type {
  CasePipelineCase,
  CasePipelineFilter,
  CasePipelineStage,
} from '../domain/casePipeline'
import { CasePipelineActivity } from './CasePipelineActivity'
import { CasePipelineFiles } from './CasePipelineFiles'
import { CasePipelineHeader } from './CasePipelineHeader'
import { CasePipelineSidebar } from './CasePipelineSidebar'
import { CasePipelineSidebarDetails } from './CasePipelineSidebarDetails'
import { CaseProductionProgress } from './CaseProductionProgress'
import { CaseProductionSteps } from './CaseProductionSteps'

export function CasePipelinePage() {
  const [cases, setCases] = useState<CasePipelineCase[]>(casePipelineFixtures)
  const [filter, setFilter] = useState<CasePipelineFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCaseId, setSelectedCaseId] = useState(casePipelineFixtures[0]?.id ?? '')

  const visibleCases = filterCasePipelineCases(cases, filter, searchTerm)
  const selectedCase = cases.find((caseItem) => caseItem.id === selectedCaseId) ?? visibleCases[0]

  function updateSelectedCase(update: (caseItem: CasePipelineCase) => CasePipelineCase) {
    if (!selectedCase) {
      return
    }

    setCases((currentCases) =>
      currentCases.map((caseItem) => (caseItem.id === selectedCase.id ? update(caseItem) : caseItem)),
    )
  }

  function moveSelectedCase(stage: CasePipelineStage) {
    updateSelectedCase((caseItem) => ({ ...caseItem, stage }))
    toast.add({ title: 'Case pipeline updated', description: `Case moved to ${stage}.`, type: 'success' })
  }

  function handleAddNote(message: string) {
    updateSelectedCase((caseItem) => ({
      ...caseItem,
      activities: [
        ...caseItem.activities,
        { id: `note-${Date.now()}`, author: 'Dr. Maya', initials: 'AM', message, createdAt: 'Now' },
      ],
    }))
    toast.add({ title: 'Note added', description: 'The case activity was updated.', type: 'success' })
  }

  if (!selectedCase) {
    return <Page size="full"><p className="rounded-md bg-surface px-4 py-10 text-center text-sm text-text-muted">No cases match your filters.</p></Page>
  }

  return (
    <Page size="full">
      <div className="grid gap-3 lg:grid-cols-[16rem_minmax(0,1fr)_15rem]">
        <CasePipelineSidebar
          cases={visibleCases}
          filter={filter}
          onFilterChange={setFilter}
          onSearchChange={setSearchTerm}
          onSelectCase={setSelectedCaseId}
          searchTerm={searchTerm}
          selectedCaseId={selectedCase.id}
        />
        <main className="grid min-w-0 gap-3">
          <CasePipelineHeader
            caseItem={selectedCase}
            onMoveForward={() => moveSelectedCase(getNextStage(selectedCase.stage))}
            onRemoveRush={() => updateSelectedCase((caseItem) => ({ ...caseItem, priority: 'Normal' }))}
            onSendBack={() => moveSelectedCase(getPreviousStage(selectedCase.stage))}
          />
          <CaseProductionProgress caseItem={selectedCase} />
          <CaseProductionSteps
            caseItem={selectedCase}
            onAssignTechnician={(stepId, technician) =>
              updateSelectedCase((caseItem) => ({
                ...caseItem,
                productionSteps: caseItem.productionSteps.map((step) =>
                  step.id === stepId ? { ...step, technician: technician === 'unassigned' ? undefined : technician } : step,
                ),
              }))
            }
            onMarkDone={(stepId) => {
              updateSelectedCase((caseItem) => ({
                ...caseItem,
                productionSteps: caseItem.productionSteps.map((step) =>
                  step.id === stepId ? { ...step, status: 'completed' } : step,
                ),
              }))
              toast.add({ title: 'Production step completed', description: 'The step was marked as done.', type: 'success' })
            }}
            onUpload={(step) => toast.add({ title: 'Upload ready', description: `Choose a file for ${step.name}.`, type: 'info' })}
          />
          <CasePipelineFiles caseItem={selectedCase} />
          <CasePipelineActivity activities={selectedCase.activities} onAddNote={handleAddNote} />
        </main>
        <CasePipelineSidebarDetails caseItem={selectedCase} />
      </div>
    </Page>
  )
}
