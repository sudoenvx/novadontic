import { z } from 'zod'

import type { ApiResponse, CursorPaginatedData } from '../../../shared/types/api'

export const doctorClinicResponseDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export const doctorResponseDtoSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  country: z.string().nullable(),
  specialty: z.string().nullable(),
  notes: z.string().nullable(),
  source: z.enum(['clinic', 'portal']),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  clinics: z.array(doctorClinicResponseDtoSchema),
})

export type DoctorResponseDto = z.infer<typeof doctorResponseDtoSchema>

export const doctorListResponseDtoSchema = z.object({
  data: z.object({
    data: z.array(doctorResponseDtoSchema),
    nextCursor: z.string().nullable(),
    total: z.number().int().nonnegative(),
  }),
}) satisfies z.ZodType<ApiResponse<CursorPaginatedData<DoctorResponseDto>>>

export const doctorResponseEnvelopeDtoSchema = z.object({
  data: doctorResponseDtoSchema,
}) satisfies z.ZodType<ApiResponse<DoctorResponseDto>>

export const doctorInputDtoSchema = z.object({
  fullName: z.string().trim().min(1).max(100),
  email: z.email().trim().max(150).nullable().optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  address: z.string().trim().max(255).nullable().optional(),
  country: z.string().trim().max(100).nullable().optional(),
  specialty: z.string().trim().max(100).nullable().optional(),
  notes: z.string().trim().max(10_000).nullable().optional(),
  source: z.enum(['clinic', 'portal']).optional(),
  isActive: z.boolean().optional(),
  clinicIds: z.array(
    z.string().refine((value) => {
      if (!/^[1-9]\d*$/.test(value) || value.length > 19) return false
      return value.length < 19 || value <= '9223372036854775807'
    }),
  ).max(100).optional(),
})

export const doctorUpdateDtoSchema = doctorInputDtoSchema
  .partial()
  .refine((input) => Object.keys(input).length > 0)

export type DoctorInputDto = z.infer<typeof doctorInputDtoSchema>
export type DoctorUpdateDto = z.infer<typeof doctorUpdateDtoSchema>
