import { z } from 'zod'

const positiveBigIntIdSchema = z.string().refine((value) => {
  if (!/^[1-9]\d*$/.test(value) || value.length > 19) return false
  return value.length < 19 || value <= '9223372036854775807'
})

const caseFieldValueSchema = z.union([
  z.string(),
  z.boolean(),
  z.array(z.string()),
])

export const caseStageResponseDtoSchema = z.object({
  id: positiveBigIntIdSchema,
  sourceStageId: positiveBigIntIdSchema.nullable(),
  sortOrder: z.number().int(),
  name: z.string(),
  slaHours: z.number().int().nullable(),
  requiresApproval: z.boolean(),
  allowedFileKinds: z.array(z.enum(['stl', 'photo', 'pdf', 'doc'])),
  status: z.enum(['pending', 'active', 'completed']),
  startedAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
})

export const caseResponseDtoSchema = z.object({
  id: z.string().regex(/^OR-[A-Z0-9-]{1,24}$/i),
  patientName: z.string(),
  patientCode: z.string(),
  request: z.string(),
  clinicId: positiveBigIntIdSchema.nullable(),
  clinicName: z.string(),
  doctorId: positiveBigIntIdSchema.nullable(),
  doctorName: z.string(),
  applianceTypeId: positiveBigIntIdSchema.nullable(),
  applianceName: z.string(),
  workflowTemplateId: positiveBigIntIdSchema.nullable(),
  workflowName: z.string(),
  categoryId: z.string(),
  categoryName: z.string(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  priority: z.enum(['Normal', 'Rush']),
  priceRule: z.enum(['full', 'discounted', 'free', 'warranty']),
  billable: z.boolean(),
  originalCaseId: z.string().nullable(),
  remakeReason: z.string().nullable(),
  caseFieldValues: z.record(z.string(), caseFieldValueSchema),
  arch: z.string(),
  units: z.number().int(),
  stage: z.string(),
  stages: z.array(caseStageResponseDtoSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const caseListResponseDtoSchema = z.object({
  data: z.object({
    data: z.array(caseResponseDtoSchema),
    nextCursor: positiveBigIntIdSchema.nullable(),
    total: z.number().int().nonnegative(),
  }),
})

export const caseResponseEnvelopeDtoSchema = z.object({
  data: caseResponseDtoSchema,
})

export const createCaseInputDtoSchema = z.object({
  patientName: z.string().trim().min(1).max(150),
  patientCode: z.string().trim().max(60).optional(),
  clinicId: positiveBigIntIdSchema.nullable(),
  doctorId: positiveBigIntIdSchema,
  applianceTypeId: positiveBigIntIdSchema,
  workflowTemplateId: positiveBigIntIdSchema,
  categoryId: z.string().trim().max(60),
  categoryName: z.string().trim().max(100),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  priority: z.enum(['Normal', 'Rush']),
  priceRule: z.enum(['full', 'discounted', 'free', 'warranty']),
  billable: z.boolean(),
  originalCaseNumber: z.string().regex(/^OR-[A-Z0-9-]{1,24}$/i).nullable().optional(),
  remakeReason: z.string().trim().max(10_000).nullable().optional(),
})
export type CreateCaseRequest = z.infer<typeof createCaseInputDtoSchema>

export const updateCaseInputDtoSchema = z.object({
  priority: z.enum(['Normal', 'Rush']).optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  caseFieldValues: z.record(z.string(), caseFieldValueSchema).optional(),
}).refine((input) => Object.keys(input).length > 0)
export type UpdateCaseRequest = z.infer<typeof updateCaseInputDtoSchema>

export const updateCaseStageStatusInputDtoSchema = z.object({
  status: z.enum(['active', 'completed']),
})

export type CaseResponseDto = z.infer<typeof caseResponseDtoSchema>
