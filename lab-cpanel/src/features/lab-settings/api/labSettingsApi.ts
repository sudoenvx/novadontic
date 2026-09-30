import { z } from 'zod'

import { httpClient } from '../../../shared/api/httpClient'
import type { LabSettings, LabSettingsSection } from '../domain/labSettings'

const settingResponseSchema = z.object({
  key: z.string(),
  value: z.string(),
  group: z.string().nullable(),
})

const settingsEnvelopeSchema = z.object({
  data: z.array(settingResponseSchema),
})

type SettingResponse = z.infer<typeof settingResponseSchema>

const settingDefinitions = {
  default_case_turnaround_days: {
    group: 'operations',
    serialize: (settings: LabSettings) =>
      String(settings.defaultCaseTurnaroundDays),
  },
  allow_clinic_portal: {
    group: 'operations',
    serialize: (settings: LabSettings) => String(settings.allowClinicPortal),
  },
  require_case_approval: {
    group: 'operations',
    serialize: (settings: LabSettings) => String(settings.requireCaseApproval),
  },
  notify_new_case: {
    group: 'notifications',
    serialize: (settings: LabSettings) => String(settings.notifyNewCase),
  },
  notify_status_change: {
    group: 'notifications',
    serialize: (settings: LabSettings) => String(settings.notifyStatusChange),
  },
  notify_production_delay: {
    group: 'notifications',
    serialize: (settings: LabSettings) =>
      String(settings.notifyProductionDelay),
  },
  notify_daily_summary: {
    group: 'notifications',
    serialize: (settings: LabSettings) => String(settings.notifyDailySummary),
  },
} satisfies Record<string, { group: LabSettingsSection; serialize: (settings: LabSettings) => string }>

function parseBooleanSetting(value: string, label: string): boolean {
  if (value === 'true') return true
  if (value === 'false') return false
  throw new Error(`The ${label} setting is invalid.`)
}

function mapSettings(records: SettingResponse[]): LabSettings {
  const values = new Map(records.map(({ key, value }) => [key, value]))

  return {
    defaultCaseTurnaroundDays: parseDays(
      getSettingValue(values, 'default_case_turnaround_days'),
    ),
    allowClinicPortal: parseBooleanSetting(
      getSettingValue(values, 'allow_clinic_portal'),
      'Clinic portal access',
    ),
    requireCaseApproval: parseBooleanSetting(
      getSettingValue(values, 'require_case_approval'),
      'Case approval',
    ),
    notifyNewCase: parseBooleanSetting(
      getSettingValue(values, 'notify_new_case'),
      'New case notification',
    ),
    notifyStatusChange: parseBooleanSetting(
      getSettingValue(values, 'notify_status_change'),
      'Status change notification',
    ),
    notifyProductionDelay: parseBooleanSetting(
      getSettingValue(values, 'notify_production_delay'),
      'Production delay notification',
    ),
    notifyDailySummary: parseBooleanSetting(
      getSettingValue(values, 'notify_daily_summary'),
      'Daily summary notification',
    ),
  }
}

function getSettingValue(values: Map<string, string>, key: string): string {
  const value = values.get(key)
  if (value === undefined) {
    throw new Error(`The "${key}" setting is missing from the server.`)
  }
  return value
}

function parseDays(value: string): number {
  if (!/^\d+$/.test(value)) {
    throw new Error('The default case turnaround setting is invalid.')
  }
  const days = Number(value)
  if (!Number.isSafeInteger(days)) {
    throw new Error('The default case turnaround setting is invalid.')
  }
  return days
}

function parseSettingsResponse(response: unknown): LabSettings {
  const parsed = settingsEnvelopeSchema.parse(response)
  return mapSettings(parsed.data)
}

export async function getLabSettings(): Promise<LabSettings> {
  const { data } = await httpClient.get('/settings')
  return parseSettingsResponse(data)
}

export async function saveLabSettingsSection(
  section: LabSettingsSection,
  settings: LabSettings,
): Promise<LabSettings> {
  const settingsToSave = Object.entries(settingDefinitions).filter(
    ([, definition]) => definition.group === section,
  )

  for (const [key, definition] of settingsToSave) {
    await httpClient.put(`/settings/${key}`, {
      value: definition.serialize(settings),
      group: definition.group,
    })
  }

  return getLabSettings()
}
