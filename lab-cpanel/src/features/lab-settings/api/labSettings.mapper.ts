import type { LabSettings, LabSettingsSection } from '../domain/labSettings'
import type {
  SettingResponseDto,
  SettingWriteDto,
} from './labSettings.dto'

function getSettingValue(settings: SettingResponseDto[], key: string): string {
  const setting = settings.find((item) => item.key === key)
  if (!setting) {
    throw new Error(`The "${key}" setting is missing from the server.`)
  }
  return setting.value
}

function parseBooleanSetting(value: string, label: string): boolean {
  if (value === 'true') return true
  if (value === 'false') return false
  throw new Error(`The ${label} setting is invalid.`)
}

function parseTurnaroundDays(value: string): number {
  if (!/^\d+$/.test(value)) {
    throw new Error('The default case turnaround setting is invalid.')
  }
  const days = Number(value)
  if (!Number.isSafeInteger(days)) {
    throw new Error('The default case turnaround setting is invalid.')
  }
  return days
}

export function mapSettingDtosToLabSettings(
  settings: SettingResponseDto[],
): LabSettings {
  return {
    defaultCaseTurnaroundDays: parseTurnaroundDays(
      getSettingValue(settings, 'default_case_turnaround_days'),
    ),
    allowClinicPortal: parseBooleanSetting(
      getSettingValue(settings, 'allow_clinic_portal'),
      'Clinic portal access',
    ),
    requireCaseApproval: parseBooleanSetting(
      getSettingValue(settings, 'require_case_approval'),
      'Case approval',
    ),
    notifyNewCase: parseBooleanSetting(
      getSettingValue(settings, 'notify_new_case'),
      'New case notification',
    ),
    notifyStatusChange: parseBooleanSetting(
      getSettingValue(settings, 'notify_status_change'),
      'Status change notification',
    ),
    notifyProductionDelay: parseBooleanSetting(
      getSettingValue(settings, 'notify_production_delay'),
      'Production delay notification',
    ),
    notifyDailySummary: parseBooleanSetting(
      getSettingValue(settings, 'notify_daily_summary'),
      'Daily summary notification',
    ),
  }
}

export function mapLabSettingsSectionToSaveDtos(
  section: LabSettingsSection,
  settings: LabSettings,
): SettingWriteDto[] {
  if (section === 'operations') {
    return [
      {
        key: 'default_case_turnaround_days',
        value: String(settings.defaultCaseTurnaroundDays),
        group: section,
      },
      {
        key: 'allow_clinic_portal',
        value: String(settings.allowClinicPortal),
        group: section,
      },
      {
        key: 'require_case_approval',
        value: String(settings.requireCaseApproval),
        group: section,
      },
    ]
  }

  return [
    {
      key: 'notify_new_case',
      value: String(settings.notifyNewCase),
      group: section,
    },
    {
      key: 'notify_status_change',
      value: String(settings.notifyStatusChange),
      group: section,
    },
    {
      key: 'notify_production_delay',
      value: String(settings.notifyProductionDelay),
      group: section,
    },
    {
      key: 'notify_daily_summary',
      value: String(settings.notifyDailySummary),
      group: section,
    },
  ]
}
