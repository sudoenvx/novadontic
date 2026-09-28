export type DashboardCaseResponse = {
  case_id: string
  patient_name: string
  clinic_name: string
  appliance_type: 'Aligner' | 'Retainer'
  case_category: string
  production_stage: 'Planning' | 'Production' | 'Quality check' | 'Ready'
  due_date: string
  case_status: 'On track' | 'Due today' | 'Needs attention'
  assignee_initials: string
}
