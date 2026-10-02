import type { CasePipelineCase } from '../../case-pipeline/domain/casePipeline'
import type { DashboardCase } from '../domain/case'

export function mapCasePipelineCaseToDashboardCase(
  caseItem: CasePipelineCase,
): DashboardCase {
  return {
    id: caseItem.id,
    patientName: caseItem.patientName,
    clinic: caseItem.clinicName,
    caseType: caseItem.caseType,
    category: caseItem.categoryName ?? 'New case',
    stage: caseItem.stage,
    dueDate: caseItem.dueDate,
    status: caseItem.status,
    assignee: '—',
  }
}
