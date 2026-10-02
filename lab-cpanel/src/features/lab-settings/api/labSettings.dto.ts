import { z } from 'zod'

import type { ApiResponse } from '../../../shared/types/api'

export const settingResponseDtoSchema = z.object({
  key: z.string(),
  value: z.string(),
  group: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type SettingResponseDto = z.infer<typeof settingResponseDtoSchema>

export const settingListResponseDtoSchema = z.object({
  data: z.array(settingResponseDtoSchema),
}) satisfies z.ZodType<ApiResponse<SettingResponseDto[]>>

export const saveSettingDtoSchema = z.object({
  value: z.string().max(60_000),
  group: z.string().trim().max(100).nullable(),
})

export type SaveSettingDto = z.infer<typeof saveSettingDtoSchema>
export type SettingWriteDto = SaveSettingDto & { key: string }
