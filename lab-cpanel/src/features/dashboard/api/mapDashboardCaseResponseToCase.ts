import type { DashboardCase } from '../domain/case'
import type { DashboardCaseResponse } from './dashboardCaseResponse'

export function mapDashboardCaseResponseToCase(
  response: DashboardCaseResponse,
): DashboardCase {
  return {
    id: response.case_id,
    patientName: response.patient_name,
    clinic: response.clinic_name,
    caseType: response.appliance_type,
    category: response.case_category,
    stage: response.production_stage,
    dueDate: response.due_date,
    status: response.case_status,
    assignee: response.assignee_initials,
  }
}
