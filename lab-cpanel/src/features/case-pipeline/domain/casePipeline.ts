export type CasePipelineStage =
  | 'Received'
  | 'Design'
  | 'Production'
  | 'Quality check'
  | 'Ready to ship'
  | 'Delivered'

export type CasePipelineStatus = 'On track' | 'Due today' | 'Needs attention'
export type CasePipelinePriority = 'Normal' | 'Rush'
export type CasePipelineFilter = 'all' | 'active' | 'rush'
export type ProductionStepStatus = 'completed' | 'active' | 'pending'

export type CasePipelineFile = {
  id: string
  name: string
  type: 'STL' | 'IMG' | 'PDF'
  size: string
  uploadedBy: string
  uploadedAt: string
}

export type CaseProductionStep = {
  id: string
  name: CasePipelineStage
  status: ProductionStepStatus
  files: CasePipelineFile[]
  technician?: string
}

export type CaseActivityItem = {
  id: string
  author: string
  initials: string
  message: string
  createdAt: string
  isSystem?: boolean
}

export type CasePipelineCase = {
  id: string
  patientName: string
  patientCode: string
  clinicName: string
  doctorName: string
  request: string
  caseType: string
  arch: string
  allergy: string
  units: number
  status: CasePipelineStatus
  priority: CasePipelinePriority
  stage: CasePipelineStage
  dueDate: string
  createdAt: string
  productionSteps: CaseProductionStep[]
  activities: CaseActivityItem[]
}

export const casePipelineStages: CasePipelineStage[] = [
  'Received',
  'Design',
  'Production',
  'Quality check',
  'Ready to ship',
  'Delivered',
]

export function filterCasePipelineCases(
  cases: CasePipelineCase[],
  filter: CasePipelineFilter,
  searchTerm: string,
) {
  const normalizedSearch = searchTerm.trim().toLowerCase()

  return cases.filter((caseItem) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && caseItem.stage !== 'Delivered') ||
      (filter === 'rush' && caseItem.priority === 'Rush')

    const matchesSearch =
      !normalizedSearch ||
      [caseItem.id, caseItem.patientName, caseItem.doctorName, caseItem.clinicName].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      )

    return matchesFilter && matchesSearch
  })
}

export function getStageIndex(stage: CasePipelineStage) {
  return casePipelineStages.indexOf(stage)
}

export function getNextStage(stage: CasePipelineStage) {
  return casePipelineStages[Math.min(getStageIndex(stage) + 1, casePipelineStages.length - 1)]
}

export function getPreviousStage(stage: CasePipelineStage) {
  return casePipelineStages[Math.max(getStageIndex(stage) - 1, 0)]
}
