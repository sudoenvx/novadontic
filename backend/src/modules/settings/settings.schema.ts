import { z } from 'zod';

const settingKeySchema = z.string().trim().min(1).max(100);

export const settingKeyParamsSchema = z.object({ key: settingKeySchema });

export const saveSettingSchema = z.object({
  value: z.string().max(60_000),
  group: z.string().trim().max(100).nullable().optional(),
});

export const listSettingsQuerySchema = z.object({
  group: z.string().trim().min(1).max(100).optional(),
});
