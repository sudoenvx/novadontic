import { casePipelineFixtures } from '../../case-pipeline/data/cases'
import type { CaseListItem } from '../domain/case'

export const caseFixtures: CaseListItem[] = casePipelineFixtures.map((caseItem) => ({
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
}))
