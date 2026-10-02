import { httpClient } from '../../../shared/api/httpClient'
import {
  saveSettingDtoSchema,
  settingListResponseDtoSchema,
  type SettingWriteDto,
  type SettingResponseDto,
} from './labSettings.dto'

export async function getSettings(): Promise<SettingResponseDto[]> {
  const response = await httpClient.get('/settings')
  return settingListResponseDtoSchema.parse(response.data).data
}

export async function saveSettings(settings: SettingWriteDto[]): Promise<void> {
  for (const setting of settings) {
    const { key, ...input } = setting
    await httpClient.put(
      `/settings/${encodeURIComponent(key)}`,
      saveSettingDtoSchema.parse(input),
    )
  }
}
