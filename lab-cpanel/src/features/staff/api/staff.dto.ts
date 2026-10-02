import { z } from 'zod'

import type { ApiResponse, CursorPaginatedData } from '../../../shared/types/api'

const positiveBigIntIdSchema = z.string().refine((value) => {
  if (!/^[1-9]\d*$/.test(value) || value.length > 19) return false
  return value.length < 19 || value <= '9223372036854775807'
})

export const staffRoleDtoSchema = z.object({
  id: positiveBigIntIdSchema,
  code: z.string(),
  name: z.string(),
})

export const staffDtoSchema = z.object({
  id: positiveBigIntIdSchema,
  fullName: z.string(),
  email: z.email(),
  phone: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  roles: z.array(staffRoleDtoSchema),
})

export const staffListEnvelopeDtoSchema = z.object({
  data: z.object({
    data: z.array(staffDtoSchema),
    nextCursor: positiveBigIntIdSchema.nullable(),
    total: z.number().int().nonnegative(),
  }),
}) satisfies z.ZodType<ApiResponse<CursorPaginatedData<z.infer<typeof staffDtoSchema>>>>

export const staffEnvelopeDtoSchema = z.object({
  data: staffDtoSchema,
}) satisfies z.ZodType<ApiResponse<z.infer<typeof staffDtoSchema>>>

export const staffInputDtoSchema = z.object({
  fullName: z.string().trim().min(1).max(150),
  email: z.email().trim().toLowerCase().max(150),
  password: z.string().min(12).max(128),
  phone: z.string().trim().max(30).nullable().optional(),
  roleIds: z.array(positiveBigIntIdSchema).min(1).max(100)
    .refine((ids) => new Set(ids).size === ids.length),
})

export const staffUpdateDtoSchema = z.object({
  fullName: z.string().trim().min(1).max(150).optional(),
  email: z.email().trim().toLowerCase().max(150).optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  roleIds: z.array(positiveBigIntIdSchema).min(1).max(100)
    .refine((ids) => new Set(ids).size === ids.length).optional(),
}).refine((input) => Object.keys(input).length > 0)

export const staffRoleOptionsEnvelopeDtoSchema = z.object({
  data: z.array(staffRoleDtoSchema),
})

export type StaffDto = z.infer<typeof staffDtoSchema>
export type StaffRoleDto = z.infer<typeof staffRoleDtoSchema>
export type StaffInputDto = z.infer<typeof staffInputDtoSchema>
export type StaffUpdateDto = z.infer<typeof staffUpdateDtoSchema>
