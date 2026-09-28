import { toLabSettings, type LabSettingsResponse } from './labSettingsResponses'

const labSettingsResponse: LabSettingsResponse = {
  default_case_turnaround_days: 7,
  allow_clinic_portal: true,
  require_case_approval: false,
  notify_new_case: true,
  notify_status_change: true,
  notify_production_delay: true,
  notify_daily_summary: false,
}

export const labSettings = toLabSettings(labSettingsResponse)
