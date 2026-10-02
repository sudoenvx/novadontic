import { z } from 'zod';

const positiveBigIntId = z.string().refine((value) => {
  if (!/^[1-9]\d*$/.test(value) || value.length > 19) return false;
  return value.length < 19 || value <= '9223372036854775807';
}, 'Must be a positive 64-bit integer');

const caseNumber = z.string().regex(/^OR-[A-Z0-9-]{1,24}$/i);
const casePriority = z.enum(['Normal', 'Rush']);
const caseBillingRule = z.enum(['full', 'discounted', 'free', 'warranty']);
const caseFieldValue = z.union([z.string(), z.boolean(), z.array(z.string())]);
const caseFieldValues = z.record(z.string().min(1).max(60), caseFieldValue).refine(
  (values) => Object.keys(values).length <= 200,
  'Too many case field values',
);
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, 'Must be a valid calendar date');
const fileKind = z.enum(['model', 'image', 'document']);

export const caseNumberParamsSchema = z.object({ caseNumber });
export const caseFileParamsSchema = z.object({
  caseNumber,
  fileId: positiveBigIntId,
});
export const caseStageParamsSchema = z.object({
  caseNumber,
  stageId: positiveBigIntId,
});

export const listCasesQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  applianceTypeId: positiveBigIntId.optional(),
  clinicId: positiveBigIntId.optional(),
  priority: casePriority.optional(),
  stage: z.string().trim().min(1).max(80).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: positiveBigIntId.optional(),
});

export const createCaseSchema = z.object({
  patientName: z.string().trim().min(1).max(150),
  patientCode: z.string().trim().max(60).optional(),
  clinicId: positiveBigIntId.nullable().optional(),
  doctorId: positiveBigIntId,
  applianceTypeId: positiveBigIntId,
  workflowTemplateId: positiveBigIntId,
  categoryId: z.string().trim().max(60).optional(),
  categoryName: z.string().trim().max(100).optional(),
  dueDate: dateOnly.nullable().optional(),
  priority: casePriority.default('Normal'),
  priceRule: caseBillingRule.default('full'),
  billable: z.boolean().default(true),
  originalCaseNumber: caseNumber.nullable().optional(),
  remakeReason: z.string().trim().max(10_000).nullable().optional(),
  caseFieldValues: caseFieldValues.optional(),
});

export const updateCaseSchema = z.object({
  priority: casePriority.optional(),
  dueDate: dateOnly.nullable().optional(),
  caseFieldValues: caseFieldValues.optional(),
}).refine((input) => Object.keys(input).length > 0, 'At least one field is required');

export const updateCaseStageStatusSchema = z.object({
  status: z.enum(['active', 'completed']),
});

export const listCaseFilesQuerySchema = z.object({
  kind: fileKind.optional(),
});

export const uploadCaseFileSchema = z.object({
  stageId: positiveBigIntId.nullable().optional(),
});

export const renameCaseFileSchema = z.object({
  name: z.string().trim().min(1).max(255).refine(
    (name) => !/[\/\\\u0000-\u001f]/.test(name),
    'File name cannot contain path separators or control characters',
  ),
});

export const createCaseCommentSchema = z.object({
  message: z.string().trim().min(1).max(10_000),
});
