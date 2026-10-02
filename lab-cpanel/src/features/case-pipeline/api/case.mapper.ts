import type { CaseListItem } from '../../cases/domain/case'
import type {
  CasePipelineCase,
  CasePipelineStatus,
} from '../domain/casePipeline'
import type { CaseResponseDto } from './case.dto'

function getDisplayDate(date: string | null): string {
  if (!date) return 'Not set'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
    new Date(`${date}T00:00:00`),
  )
}

function getCaseStatus(date: string | null): CasePipelineStatus {
  if (!date) return 'On track'
  const dueDate = new Date(`${date}T00:00:00`)
  const today = new Date()
  dueDate.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  if (dueDate < today) return 'Needs attention'
  if (dueDate.getTime() === today.getTime()) return 'Due today'
  return 'On track'
}

export function mapCaseResponseToCasePipelineCase(
  response: CaseResponseDto,
): CasePipelineCase {
  return {
    id: response.id,
    patientName: response.patientName,
    patientCode: response.patientCode || 'Not provided',
    clinicName: response.clinicName,
    doctorName: response.doctorName,
    request: response.request,
    caseType: response.applianceName,
    ...(response.applianceTypeId ? { applianceId: response.applianceTypeId } : {}),
    ...(response.workflowTemplateId
      ? { workflowTemplateId: response.workflowTemplateId }
      : {}),
    ...(response.categoryId ? { categoryId: response.categoryId } : {}),
    ...(response.categoryName ? { categoryName: response.categoryName } : {}),
    ...(response.workflowName ? { workflowName: response.workflowName } : {}),
    priceRule: response.priceRule,
    billable: response.billable,
    ...(response.originalCaseId ? { originalCaseId: response.originalCaseId } : {}),
    ...(response.remakeReason ? { remakeReason: response.remakeReason } : {}),
    caseFieldValues: response.caseFieldValues,
    arch: response.arch,
    units: response.units,
    status: getCaseStatus(response.dueDate),
    priority: response.priority,
    stage: response.stage,
    dueDate: getDisplayDate(response.dueDate),
    createdAt: new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
      new Date(response.createdAt),
    ),
    productionSteps: response.stages.map((stage) => ({
      id: stage.id,
      name: stage.name,
      status: stage.status,
      files: [],
      technicians: [],
      slaHours: stage.slaHours,
      requiresApproval: stage.requiresApproval,
      allowedFileKinds: stage.allowedFileKinds,
    })),
    activities: [],
  }
}

export function mapCaseResponseToCaseListItem(
  response: CaseResponseDto,
): CaseListItem {
  return mapCasePipelineCaseToCaseListItem(mapCaseResponseToCasePipelineCase(response))
}

export function mapCasePipelineCaseToCaseListItem(
  caseItem: CasePipelineCase,
): CaseListItem {
  return {
    id: caseItem.id,
    patientName: caseItem.patientName,
    patientCode: caseItem.patientCode,
    clinicName: caseItem.clinicName,
    doctorName: caseItem.doctorName,
    applianceType: caseItem.caseType,
    category: caseItem.categoryName ?? caseItem.categoryId ?? 'New case',
    stage: caseItem.stage,
    dueDate: caseItem.dueDate,
    priority: caseItem.priority,
    status: caseItem.status,
    createdAt: caseItem.createdAt,
  }
}
