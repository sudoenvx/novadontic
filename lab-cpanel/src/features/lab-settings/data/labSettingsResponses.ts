import type { LabSettings } from '../domain/labSettings'

export type LabSettingsResponse = {
  lab_name: string
  email: string
  phone_number: string
  country: string
  address: string
  allow_clinic_portal: boolean
  require_case_approval: boolean
  notify_new_case: boolean
  notify_status_change: boolean
  notify_production_delay: boolean
  notify_daily_summary: boolean
}

export function toLabSettings(response: LabSettingsResponse): LabSettings {
  return {
    labName: response.lab_name,
    email: response.email,
    phoneNumber: response.phone_number,
    country: response.country,
    address: response.address,
    allowClinicPortal: response.allow_clinic_portal,
    requireCaseApproval: response.require_case_approval,
    notifyNewCase: response.notify_new_case,
    notifyStatusChange: response.notify_status_change,
    notifyProductionDelay: response.notify_production_delay,
    notifyDailySummary: response.notify_daily_summary,
  }
}
