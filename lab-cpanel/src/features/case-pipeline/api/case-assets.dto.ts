import { z } from 'zod'

const positiveBigIntIdSchema = z.string().regex(/^[1-9]\d*$/)

export const caseFileResponseDtoSchema = z.object({
  id: positiveBigIntIdSchema,
  caseNumber: z.string(),
  stageId: positiveBigIntIdSchema.nullable(),
  stageName: z.string().nullable(),
  name: z.string(),
  mimeType: z.string(),
  kind: z.enum(['model', 'image', 'document']),
  sizeBytes: z.number().int().nonnegative(),
  uploadedBy: z.string(),
  createdAt: z.string().datetime(),
})

export const caseFilesResponseDtoSchema = z.object({
  data: z.array(caseFileResponseDtoSchema),
})

export const caseFileResponseEnvelopeDtoSchema = z.object({
  data: caseFileResponseDtoSchema,
})

export const caseTimelineEntryResponseDtoSchema = z.object({
  id: positiveBigIntIdSchema,
  kind: z.enum(['event', 'comment']),
  eventType: z.string().nullable(),
  message: z.string(),
  author: z.string(),
  createdAt: z.string().datetime(),
})

export const caseTimelineResponseDtoSchema = z.object({
  data: z.array(caseTimelineEntryResponseDtoSchema),
})

export const caseTimelineEntryResponseEnvelopeDtoSchema = z.object({
  data: caseTimelineEntryResponseDtoSchema,
})

export type CaseFileResponseDto = z.infer<typeof caseFileResponseDtoSchema>
export type CaseTimelineEntryResponseDto = z.infer<
  typeof caseTimelineEntryResponseDtoSchema
>
