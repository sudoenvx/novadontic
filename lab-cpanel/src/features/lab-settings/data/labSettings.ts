import { toLabSettings, type LabSettingsResponse } from './labSettingsResponses'

const labSettingsResponse: LabSettingsResponse = {
  lab_name: 'Maya Dental Lab',
  email: 'hello@mayadentallab.com',
  phone_number: '+20 100 555 0198',
  country: 'Palestine',
  address: '12 Tahrir Street, Cairo',
  allow_clinic_portal: true,
  require_case_approval: false,
  notify_new_case: true,
  notify_status_change: true,
  notify_production_delay: true,
  notify_daily_summary: false,
}

export const labSettings = toLabSettings(labSettingsResponse)
