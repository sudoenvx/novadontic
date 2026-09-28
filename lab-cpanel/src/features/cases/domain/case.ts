import type {
  CasePipelinePriority,
  CasePipelineStage,
  CasePipelineStatus,
} from '../../case-pipeline/domain/casePipeline'

export type CaseListItem = {
  id: string
  patientName: string
  patientCode: string
  clinicName: string
  doctorName: string
  applianceType: string
  category: string
  stage: CasePipelineStage
  dueDate: string
  priority: CasePipelinePriority
  status: CasePipelineStatus
  createdAt: string
}

export type CaseListFilters = {
  searchTerm: string
  applianceType: string
  category: string
  clinicName: string
  stage: string
  priority: string
  status: string
}

export const emptyCaseListFilters: CaseListFilters = {
  searchTerm: '',
  applianceType: 'all',
  category: 'all',
  clinicName: 'all',
  stage: 'all',
  priority: 'all',
  status: 'all',
}

export function filterCaseList(items: CaseListItem[], filters: CaseListFilters) {
  const searchTerm = filters.searchTerm.trim().toLowerCase()

  return items.filter((caseItem) => {
    const matchesSearch = !searchTerm || [
      caseItem.id,
      caseItem.patientName,
      caseItem.patientCode,
      caseItem.clinicName,
      caseItem.doctorName,
    ].some((value) => value.toLowerCase().includes(searchTerm))

    return matchesSearch
      && matchesFilter(caseItem.applianceType, filters.applianceType)
      && matchesFilter(caseItem.category, filters.category)
      && matchesFilter(caseItem.clinicName, filters.clinicName)
      && matchesFilter(caseItem.stage, filters.stage)
      && matchesFilter(caseItem.priority, filters.priority)
      && matchesFilter(caseItem.status, filters.status)
  })
}

function matchesFilter(value: string, selectedValue: string) {
  return selectedValue === 'all' || value === selectedValue
}
