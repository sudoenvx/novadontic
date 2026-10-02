import { z } from 'zod'

const positiveBigIntIdSchema = z.string().refine((value) => {
  if (!/^[1-9]\d*$/.test(value) || value.length > 19) return false
  return value.length < 19 || value <= '9223372036854775807'
})

export const workflowStageResponseDtoSchema = z.object({
  id: positiveBigIntIdSchema,
  sortOrder: z.number().int(),
  name: z.string(),
  slaHours: z.number().int().nullable(),
  requiresApproval: z.boolean(),
  allowedFileKinds: z.array(z.enum(['stl', 'photo', 'pdf', 'doc'])),
})

export const workflowTemplateResponseDtoSchema = z.object({
  id: positiveBigIntIdSchema,
  applianceTypeId: positiveBigIntIdSchema.nullable(),
  name: z.string(),
  isDefault: z.boolean(),
  stages: z.array(workflowStageResponseDtoSchema),
})

export const workflowTemplateListResponseDtoSchema = z.object({
  data: z.array(workflowTemplateResponseDtoSchema),
})

export const workflowTemplateResponseEnvelopeDtoSchema = z.object({
  data: workflowTemplateResponseDtoSchema,
})

export const workflowStageResponseEnvelopeDtoSchema = z.object({
  data: workflowStageResponseDtoSchema,
})

export const workflowStageListResponseEnvelopeDtoSchema = z.object({
  data: z.array(workflowStageResponseDtoSchema),
})

export const workflowTemplateOptionResponseDtoSchema =
  workflowTemplateResponseDtoSchema.pick({
    id: true,
    applianceTypeId: true,
    name: true,
    isDefault: true,
  })

export const workflowTemplateOptionListResponseDtoSchema = z.object({
  data: z.array(workflowTemplateOptionResponseDtoSchema),
})

export const workflowTemplateInputDtoSchema = z.object({
  applianceTypeId: positiveBigIntIdSchema.nullable(),
  name: z.string().trim().min(1).max(100),
  isDefault: z.boolean(),
})

export const workflowTemplateUpdateDtoSchema = z.object({
  applianceTypeId: positiveBigIntIdSchema.nullable().optional(),
  name: z.string().trim().min(1).max(100).optional(),
  isDefault: z.boolean().optional(),
}).refine((input) => Object.keys(input).length > 0)

export const workflowStageInputDtoSchema = z.object({
  name: z.string().trim().min(1).max(80),
  slaHours: z.number().int().positive().nullable(),
  requiresApproval: z.boolean(),
  allowedFileKinds: z.array(z.enum(['stl', 'photo', 'pdf', 'doc'])).max(4),
})

export type WorkflowTemplateResponseDto = z.infer<
  typeof workflowTemplateResponseDtoSchema
>
export type WorkflowStageResponseDto = z.infer<
  typeof workflowStageResponseDtoSchema
>
