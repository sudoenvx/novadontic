import type { LabSettings } from '../domain/labSettings'

export type LabSettingsResponse = {
  default_case_turnaround_days: number
  allow_clinic_portal: boolean
  require_case_approval: boolean
  notify_new_case: boolean
  notify_status_change: boolean
  notify_production_delay: boolean
  notify_daily_summary: boolean
}

export function toLabSettings(response: LabSettingsResponse): LabSettings {
  return {
    defaultCaseTurnaroundDays: response.default_case_turnaround_days,
    allowClinicPortal: response.allow_clinic_portal,
    requireCaseApproval: response.require_case_approval,
    notifyNewCase: response.notify_new_case,
    notifyStatusChange: response.notify_status_change,
    notifyProductionDelay: response.notify_production_delay,
    notifyDailySummary: response.notify_daily_summary,
  }
}
