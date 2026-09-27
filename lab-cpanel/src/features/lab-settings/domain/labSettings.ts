export type LabSettingsSection =
  | 'profile'
  | 'operations'
  | 'notifications'

export type LabSettings = {
  labName: string
  email: string
  phoneNumber: string
  country: string
  address: string
  allowClinicPortal: boolean
  requireCaseApproval: boolean
  notifyNewCase: boolean
  notifyStatusChange: boolean
  notifyProductionDelay: boolean
  notifyDailySummary: boolean
}

export function getLabSettingsSectionLabel(section: LabSettingsSection) {
  const labels: Record<LabSettingsSection, string> = {
    profile: 'Lab profile',
    operations: 'Operations',
    notifications: 'Notifications',
  }

  return labels[section]
}
