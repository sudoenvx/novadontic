import type { CaseBillingRule } from '../../domain/caseCategory'
import type { CasePipelinePriority } from '../../domain/casePipeline'

export type CreateCaseValues = {
  patientName: string
  patientCode: string
  clinicId: string
  doctorId: string
  applianceId: string
  categoryId: string
  workflowTemplateId: string
  dueDate?: string
  priority: CasePipelinePriority
  priceRule: CaseBillingRule
  billable: boolean
  originalCaseId?: string
  remakeReason?: string
}

export type CreateCaseValueUpdater = <Key extends keyof CreateCaseValues>(
  key: Key,
  value: CreateCaseValues[Key],
) => void
