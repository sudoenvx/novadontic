import { z } from 'zod'

import type { ApiResponse, CursorPaginatedData } from '../../../shared/types/api'

const positiveBigIntIdSchema = z.string().refine((value) => {
  if (!/^[1-9]\d*$/.test(value) || value.length > 19) return false
  return value.length < 19 || value <= '9223372036854775807'
}, 'Expected a positive 64-bit integer ID')

const applianceFieldTypeSchema = z.enum([
  'text',
  'number',
  'select',
  'multiselect',
  'textarea',
  'date',
  'checkbox',
  'file',
  'image',
])

const fieldOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
})

export const applianceFieldResponseDtoSchema = z.object({
  id: positiveBigIntIdSchema,
  groupId: positiveBigIntIdSchema.nullable(),
  key: z.string(),
  label: z.string(),
  type: applianceFieldTypeSchema,
  options: z.array(fieldOptionSchema),
  defaultValue: z.string().nullable(),
  dependsOn: z.string().nullable(),
  dependsOnValue: z.string().nullable(),
  required: z.boolean(),
  sortOrder: z.number().int(),
  helpText: z.string().nullable(),
})

export const applianceFieldGroupResponseDtoSchema = z.object({
  id: positiveBigIntIdSchema,
  name: z.string(),
  sortOrder: z.number().int(),
  fields: z.array(applianceFieldResponseDtoSchema),
})

export const applianceResponseDtoSchema = z.object({
  id: positiveBigIntIdSchema,
  code: z.string(),
  name: z.string(),
  source: z.enum(['Platform default', 'Custom type']),
  color: z.string().nullable(),
  isActive: z.boolean(),
  fieldGroups: z.array(applianceFieldGroupResponseDtoSchema),
})

export type ApplianceResponseDto = z.infer<typeof applianceResponseDtoSchema>
export type ApplianceFieldGroupResponseDto = z.infer<
  typeof applianceFieldGroupResponseDtoSchema
>
export type ApplianceFieldResponseDto = z.infer<
  typeof applianceFieldResponseDtoSchema
>

export const applianceListResponseDtoSchema = z.object({
  data: z.object({
    data: z.array(applianceResponseDtoSchema),
    nextCursor: positiveBigIntIdSchema.nullable(),
    total: z.number().int().nonnegative(),
  }),
}) satisfies z.ZodType<ApiResponse<CursorPaginatedData<ApplianceResponseDto>>>

export const applianceResponseEnvelopeDtoSchema = z.object({
  data: applianceResponseDtoSchema,
}) satisfies z.ZodType<ApiResponse<ApplianceResponseDto>>

export const applianceGroupListResponseDtoSchema = z.object({
  data: z.array(applianceFieldGroupResponseDtoSchema),
}) satisfies z.ZodType<ApiResponse<ApplianceFieldGroupResponseDto[]>>

export const applianceGroupResponseEnvelopeDtoSchema = z.object({
  data: applianceFieldGroupResponseDtoSchema,
}) satisfies z.ZodType<ApiResponse<ApplianceFieldGroupResponseDto>>

export const applianceFieldResponseEnvelopeDtoSchema = z.object({
  data: applianceFieldResponseDtoSchema,
}) satisfies z.ZodType<ApiResponse<ApplianceFieldResponseDto>>

const applianceTypeFieldsDtoSchema = z.object({
  name: z.string().trim().min(1).max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
})

export const applianceTypeInputDtoSchema = applianceTypeFieldsDtoSchema
export const applianceTypeUpdateDtoSchema = applianceTypeFieldsDtoSchema
  .partial()
  .refine((input) => Object.keys(input).length > 0)

export const applianceActivationDtoSchema = z.object({
  isActive: z.boolean(),
})

const applianceGroupFieldsDtoSchema = z.object({
  name: z.string().trim().min(1).max(100),
  sortOrder: z.number().int().min(0).max(32_767).optional(),
})

export const applianceGroupInputDtoSchema = applianceGroupFieldsDtoSchema
export const applianceGroupUpdateDtoSchema =
  applianceGroupFieldsDtoSchema.partial().refine(
    (input) => Object.keys(input).length > 0,
  )

const fieldOptionsDtoSchema = z.array(
  z.object({
    label: z.string().trim().min(1).max(120),
    value: z.string().trim().min(1).max(120),
  }),
).max(100).refine(
  (options) => new Set(options.map(({ value }) => value)).size === options.length,
)

const applianceFieldFieldsDtoSchema = z.object({
  key: z.string().trim().regex(/^[a-z][a-z0-9_]*$/).max(60),
  label: z.string().trim().min(1).max(120),
  type: applianceFieldTypeSchema,
  options: fieldOptionsDtoSchema,
  defaultValue: z.string().max(10_000).nullable().optional(),
  dependsOn: z.string().trim().min(1).max(60).nullable().optional(),
  dependsOnValue: z.string().max(255).nullable().optional(),
  required: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(32_767).optional(),
  helpText: z.string().trim().max(200).nullable().optional(),
})

export const applianceFieldInputDtoSchema = applianceFieldFieldsDtoSchema.refine(
  (input) =>
    ['select', 'multiselect'].includes(input.type) || input.options.length === 0,
)
export const applianceFieldUpdateDtoSchema =
  applianceFieldFieldsDtoSchema.partial().refine(
    (input) => Object.keys(input).length > 0,
  )

export type ApplianceTypeInputDto = z.infer<typeof applianceTypeInputDtoSchema>
export type ApplianceTypeUpdateDto = z.infer<
  typeof applianceTypeUpdateDtoSchema
>
export type ApplianceGroupInputDto = z.infer<typeof applianceGroupInputDtoSchema>
export type ApplianceGroupUpdateDto = z.infer<
  typeof applianceGroupUpdateDtoSchema
>
export type ApplianceFieldInputDto = z.infer<typeof applianceFieldInputDtoSchema>
export type ApplianceFieldUpdateDto = z.infer<
  typeof applianceFieldUpdateDtoSchema
>
