import type { DashboardCaseResponse } from '../api/dashboardCaseResponse'
import { mapDashboardCaseResponseToCase } from '../api/mapDashboardCaseResponseToCase'

const dashboardCaseResponses: DashboardCaseResponse[] = [
  {
    case_id: 'OR-4821',
    patient_name: 'Yasmin Adel',
    clinic_name: 'Smile Studio',
    appliance_type: 'Aligner',
    case_category: 'Refinement',
    production_stage: 'Production',
    due_date: 'Today',
    case_status: 'Due today',
    assignee_initials: 'NH',
  },
  {
    case_id: 'OR-4817',
    patient_name: 'Omar Khaled',
    clinic_name: 'Bright Dental',
    appliance_type: 'Aligner',
    case_category: 'New case',
    production_stage: 'Quality check',
    due_date: 'Tomorrow',
    case_status: 'On track',
    assignee_initials: 'MA',
  },
  {
    case_id: 'OR-4814',
    patient_name: 'Lina Samir',
    clinic_name: 'The Dental House',
    appliance_type: 'Aligner',
    case_category: 'New case',
    production_stage: 'Planning',
    due_date: '18 Sep',
    case_status: 'Needs attention',
    assignee_initials: 'OS',
  },
  {
    case_id: 'OR-4809',
    patient_name: 'Adam Nabil',
    clinic_name: 'Smile Studio',
    appliance_type: 'Aligner',
    case_category: 'New case',
    production_stage: 'Ready',
    due_date: '19 Sep',
    case_status: 'On track',
    assignee_initials: 'MA',
  },
  {
    case_id: 'OR-4804',
    patient_name: 'Mariam Tarek',
    clinic_name: 'Ortho Care',
    appliance_type: 'Aligner',
    case_category: 'Refinement',
    production_stage: 'Production',
    due_date: '20 Sep',
    case_status: 'On track',
    assignee_initials: 'NH',
  },
]

export const caseFixtures = dashboardCaseResponses.map(mapDashboardCaseResponseToCase)
