export type DashboardCaseResponse = {
  case_id: string
  patient_name: string
  clinic_name: string
  appliance_type: 'Clear aligners' | 'Retainers' | 'Expanders' | 'Fixed appliances'
  production_stage: 'Planning' | 'Production' | 'Quality check' | 'Ready'
  due_date: string
  case_status: 'On track' | 'Due today' | 'Needs attention'
  assignee_initials: string
}
