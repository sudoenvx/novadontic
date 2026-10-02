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

export type CaseConditionField =
  | 'status'
  | 'priority'
  | 'appliance'
  | 'category'
  | 'clinic'
  | 'stage'
  | 'dueDate'

export type CaseConditionOperator =
  | 'is'
  | 'is-not'
  | 'contains'
  | 'greater-than'
  | 'less-than'
  | 'on-or-after'
  | 'on-or-before'

export type CaseListCondition = {
  field: CaseConditionField
  operator: CaseConditionOperator
  value: string
}

export type CaseListFilters = {
  searchTerm: string
  conditions: CaseListCondition[]
}

export const emptyCaseListFilters: CaseListFilters = {
  searchTerm: '',
  conditions: [],
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

    return matchesSearch && filters.conditions.every((condition) =>
      matchesCondition(caseItem, condition),
    )
  })
}

function matchesCondition(caseItem: CaseListItem, condition: CaseListCondition) {
  const actualValue = getConditionValue(caseItem, condition.field)
  const expectedValue = condition.value
  const normalizedActual = actualValue.toLocaleLowerCase()
  const normalizedExpected = expectedValue.toLocaleLowerCase()
  const comparison = condition.field === 'dueDate'
    ? compareConditionValues(actualValue, expectedValue, condition.field)
    : undefined

  switch (condition.operator) {
    case 'is':
      return comparison === undefined ? normalizedActual === normalizedExpected : comparison === 0
    case 'is-not':
      return comparison === undefined ? normalizedActual !== normalizedExpected : comparison !== 0
    case 'contains':
      return normalizedActual.includes(normalizedExpected)
    case 'greater-than':
      return compareConditionValues(actualValue, expectedValue, condition.field) > 0
    case 'less-than':
      return compareConditionValues(actualValue, expectedValue, condition.field) < 0
    case 'on-or-after':
      return compareConditionValues(actualValue, expectedValue, condition.field) >= 0
    case 'on-or-before':
      return compareConditionValues(actualValue, expectedValue, condition.field) <= 0
  }
}

function getConditionValue(caseItem: CaseListItem, field: CaseConditionField) {
  switch (field) {
    case 'status':
      return caseItem.status
    case 'priority':
      return caseItem.priority
    case 'appliance':
      return caseItem.applianceType
    case 'category':
      return caseItem.category
    case 'clinic':
      return caseItem.clinicName
    case 'stage':
      return caseItem.stage
    case 'dueDate':
      return caseItem.dueDate
  }
}

function compareConditionValues(
  actualValue: string,
  expectedValue: string,
  field: CaseConditionField,
) {
  if (field === 'dueDate') {
    const actualDate = parseDueDate(actualValue)
    const expectedDate = new Date(expectedValue)
    if (Number.isNaN(actualDate.getTime()) || Number.isNaN(expectedDate.getTime())) {
      return Number.NaN
    }
    return actualDate.getTime() - expectedDate.getTime()
  }

  return actualValue.localeCompare(expectedValue, undefined, { sensitivity: 'base' })
}

function parseDueDate(value: string) {
  const normalized = value.trim().toLowerCase()
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const relativeDays = normalized.match(/(\d+)\s+days?/)
  if (normalized === 'today' || normalized === 'due today') return today
  if (normalized === 'tomorrow' || normalized === 'due tomorrow') {
    today.setUTCDate(today.getUTCDate() + 1)
    return today
  }
  if (normalized === 'yesterday' || normalized === 'due yesterday') {
    today.setUTCDate(today.getUTCDate() - 1)
    return today
  }
  if (normalized.startsWith('overdue')) {
    today.setUTCDate(today.getUTCDate() - Number(relativeDays?.[1] ?? 1))
    return today
  }
  if (normalized.startsWith('in ')) {
    today.setUTCDate(today.getUTCDate() + Number(relativeDays?.[1] ?? 0))
    return today
  }

  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) {
    parsed.setUTCHours(0, 0, 0, 0)
    return parsed
  }

  const withCurrentYear = new Date(`${value} ${new Date().getFullYear()}`)
  withCurrentYear.setUTCHours(0, 0, 0, 0)
  return withCurrentYear
}
