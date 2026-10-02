import { z } from 'zod'

import type { ApiResponse, CursorPaginatedData } from '../../../shared/types/api'

const positiveBigIntIdDtoSchema = z.string().refine((value) => {
  if (!/^[1-9]\d*$/.test(value) || value.length > 19) return false
  return value.length < 19 || value <= '9223372036854775807'
}, 'Must be a positive 64-bit integer')

export const clinicOptionResponseDtoSchema = z.object({
  id: positiveBigIntIdDtoSchema,
  name: z.string(),
})

export const clinicDoctorResponseDtoSchema = z.object({
  id: positiveBigIntIdDtoSchema,
  fullName: z.string(),
  email: z.string().nullable(),
  specialty: z.string().nullable(),
  isActive: z.boolean(),
})

export const clinicResponseDtoSchema = z.object({
  id: positiveBigIntIdDtoSchema,
  name: z.string(),
  legalName: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  website: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  notes: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  doctors: z.array(clinicDoctorResponseDtoSchema),
})

export type ClinicResponseDto = z.infer<typeof clinicResponseDtoSchema>
export type ClinicOptionResponseDto = z.infer<
  typeof clinicOptionResponseDtoSchema
>

export const clinicListResponseDtoSchema = z.object({
  data: z.object({
    data: z.array(clinicResponseDtoSchema),
    nextCursor: z.string().nullable(),
    total: z.number().int().nonnegative(),
  }),
}) satisfies z.ZodType<ApiResponse<CursorPaginatedData<ClinicResponseDto>>>

export const clinicResponseEnvelopeDtoSchema = z.object({
  data: clinicResponseDtoSchema,
}) satisfies z.ZodType<ApiResponse<ClinicResponseDto>>

const clinicFieldsDtoSchema = z.object({
  name: z.string().trim().min(1).max(150),
  legalName: z.string().trim().max(200).nullable().optional(),
  email: z.email().trim().max(150).nullable().optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  website: z.url().trim().max(255).nullable().optional(),
  address: z.string().trim().max(200).nullable().optional(),
  city: z.string().trim().max(100).nullable().optional(),
  notes: z.string().trim().max(10_000).nullable().optional(),
  isActive: z.boolean().optional(),
  doctorIds: z.array(positiveBigIntIdDtoSchema).max(100).refine(
    (ids) => new Set(ids).size === ids.length,
    'Doctor IDs must be unique',
  ).optional(),
})

export const clinicInputDtoSchema = clinicFieldsDtoSchema

export const clinicUpdateDtoSchema = clinicFieldsDtoSchema
  .partial()
  .refine((input) => Object.keys(input).length > 0)

export const clinicOptionListResponseDtoSchema = z.object({
  data: z.object({
    data: z.array(clinicOptionResponseDtoSchema),
    nextCursor: z.string().nullable(),
    total: z.number().int().nonnegative(),
  }),
}) satisfies z.ZodType<
  ApiResponse<CursorPaginatedData<ClinicOptionResponseDto>>
>

export type ClinicInputDto = z.infer<typeof clinicInputDtoSchema>
export type ClinicUpdateDto = z.infer<typeof clinicUpdateDtoSchema>
