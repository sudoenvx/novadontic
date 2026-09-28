export type LabSettingsSection =
  | 'operations'
  | 'notifications'

export type LabSettings = {
  defaultCaseTurnaroundDays: number
  allowClinicPortal: boolean
  requireCaseApproval: boolean
  notifyNewCase: boolean
  notifyStatusChange: boolean
  notifyProductionDelay: boolean
  notifyDailySummary: boolean
}

export function getLabSettingsSectionLabel(section: LabSettingsSection) {
  const labels: Record<LabSettingsSection, string> = {
    operations: 'Operations',
    notifications: 'Notifications',
  }

  return labels[section]
}
